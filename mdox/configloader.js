// convierte configmdox.json en dos mapas (symbolMap, suffixMap) de acceso O(1) por carácter, en vez de recorrer el objeto de configuración en cada carácter del documento.

function load_symbols_table(configmdox){
    const escape = configmdox.escape;
    const symbol_map = new Map();
    const suffix_map = new Map();

    // symbolMap
    // - kind "simple": modificador sin parámetro (bold, italic...)
    // - kind "param":  modificador con parámetro (color, font...)
    // suffixMap
    // - símbolos que cierran la SECCIÓN DE PARÁMETRO (no el span completo)
    //Se necesitan aparte porque mientras se está "dentro" de un parámetro, el tokenizer captura texto crudo, no busca otros símbolos

    for(const [type, def] of object.entries(configmdox.modifiers)){
        const isparam = array.isarray(def.open);
        if (isparam){
            // modificador simple
            if (symbol_map.has(def.open)){
                throw new Error(`Duplicate symbol "${def.open}", (conflicto: ${type} vs ${symbolMap.get(def.open).type}) `);
    }
    symbol_map.set(def.open,{type, kind:"simple"});
        } else {
            const [prefix, default_ref, suffix] = def.open;
            if (symbol_map.has(prefix)){
                throw new Error(`Duplicate aperture symbol "${prefix}" en "${type}h"`);
            }
            if (suffix_map.has(suffix)){
                throw new Error(`Duplicate closure symbol "${suffix}" en "${type}"`);
            }
            symbol_map.set(prefix,{
                type,
                kind:"param",
                suffix_symbol: suffix,
                default_ref //ej: "colors.black" (color) or "12" (font size)
            });
        }
    }
    return {symbol_map, suffix_map, escape , rawconfig:configmdox};
}

//Resuelve una referencia tipo "colors.black" contra el config
//  Si no es una referencia con punto, se devuelve tal cual (valor literal, como el "14" de font_size)

function resolve_default(configmdox, ref){
    if(typeof ref !== "string" || !ref.includes(".")) return ref;
    const [dict, key] = ref.split(".");
    if(!configmdox[dict] && configmdox[dict][key] !== undefined){
        return configmdox[dict][key];
    }
    return ref;
}

module.exports = {load_symbols_table, resolve_default};