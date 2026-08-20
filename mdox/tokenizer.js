//Pasada única sobre el texto. Como cada símbolo definido en configmdox.json es un único carácter Unicode, no hace falta lookahead: se decide el
// significado de cada carácter mirando solo el carácter actual y el estado acumulado (pila de modificadores abiertos / captura de parámetro).

function tokenize(text, symbol_table){
    const {symbol_map, suffix_map, escape} = symbol_table;
    const tokens = [];
    const open_stack = []; // lista de tipos abiertos, para saber si cierra o abre
    let text_buffer = "";
    let escaping = false;
    let param_capture = null; // {type, suffix_symbol, buffer}

    function flush_text(){
        if(text_buffer.length > 0){
            tokens.push({kind:"text", value:text_buffer});
            text_buffer = "";
        }
    }
    for (const ch of text){
        if (escaping){  
            text_buffer += ch;
            escaping = false;
            continue;
        }
    
    if (ch === escape){
        escaping = true;
        continue;
    }
    // capturar el valor de un parámetro (ej. entre 〒 y 〩)
    if (param_capture){
        if (ch === param_capture.suffix_symbol){
            flush_text();
            tokens.push({
                kind: "OPEN_PARAM",
                type: param_capture.type,
                value: param_capture.buffer,
            });
            open_stack.push(param_capture.type);
            param_capture = null;
        }else{
            param_capture.buffer += ch;
        }
        continue;
    }
    //simbolo conocido?
    const def = symbol_map.get(ch);
    if (def) {
    const topOfStack = open_stack[open_stack.length - 1];
    if (def.kind === "simple") {
        if (topOfStack === def.type) {
            flush_text();
            tokens.push({ kind: "CLOSE", type: def.type });
            open_stack.pop();
        } else {
            flush_text();
            tokens.push({ kind: "OPEN", type: def.type });
            open_stack.push(def.type);
        }
        continue;
        }
    if (def.kind === "param") {
        if (topOfStack === def.type) {
          // Este símbolo ya estaba abierto -> es el cierre del span completo.
            flush_text();
            tokens.push({ kind: "CLOSE", type: def.type });
            open_stack.pop();
        } else {
          // Empieza una nueva sección de parámetro.
            param_capture = { type: def.type, suffix_symbol: def.suffix_symbol, buffer: "" };
        }
        continue;
        }
    }
    // Símbolo de sufijo huérfano (apareció sin una apertura de parámetro activa)
    text_buffer += ch;
    }
    flush_text();
    if (open_stack.length > 0) {
        tokens.warning["modifiers_not_closed: ${open_stack.join(", ")}"];
    }
    return tokens;
}

module.exports = {tokenize};

