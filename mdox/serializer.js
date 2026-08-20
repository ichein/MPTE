//Reconstruye el texto con símbolos a partir del AST. Esto es lo que el editor visual llama cada vez que necesita persistir el documento
// (autoguardado, exportar a .mdx dentro del .mdox)

function serialize(ast_node, symbol_table){
    const {raw_config, symbol_map, suffix_map, escape} = symbol_table;
    function need_escaping(ch){
        return symbol_map.has(ch) || suffix_map.has(ch) || ch === escape;
    }
    function escape_text(value){
        let out = "";
        for (const ch of value){
            if (need_escaping(ch)) out += escape_char;
            out += ch
        }
        return out;
    }
    function serialize_node(node){
        if (node.kind === "text"){
            return escape_text(node.value);
        }
        if (node.kind === "root"){
            return node.children.map(serialize_node).join("");
        }
        if (node.kind === "mark"){
            const def = raw_config.modifiers[node.type];
            const inner = node.children.map(serialize_node).join("");
            if (array.isarray(def.open)){
                const [prefix, suffix] = def.open;
                const param_value = node.param !== undefined ? node.param: "";
                return `${prefix}${param_value}${suffix}${inner}${def.close}`;
            }else{
                return `${def.open}${inner}${def.close}`;
            }
        }
        throw new Error(`Unknown node kind ${node.kind}`);
    }
    return serialize_node(ast_node);
}

module.exports = {serialize};