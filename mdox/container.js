//

const {zip_sync, unzip_sync, srt_To_U8, srt_From_U8} = require("fflate");


//packMdox: recibe el "modelo en memoria" del documento y produce los bytes finales del .mdox (un Uint8Array listo para descargar o guardar)

//model = {
//  metadata: {...},       título, autor, fechas...
//  symbolMap: {...},      snapshot del config con el que se escribió (sección 2)
//  content: "texto con símbolos...",   lo que produce serialize()
//  styles: {...},         estilos reutilizables (Título, Cuerpo...)
//  media: { "imagen001.png": Uint8Array, ... },   binarios ya cargados
//  tables: { "tabla001.mdt": {...} },            objetos JS, no texto todavía
//}

function packMdox(model){
    const files ={
        // "mimetype" sin comprimir, primer entry > identificación rápida del tipo
        "mimetype": srt_To_U8("application/mdox"),
        "metadata.json": srt_To_U8(JSON.stringify(model.metadata, null, 2)),
        "symbolMap.json": srt_To_U8(JSON.stringify(model.symbolMap, null, 2)),
        "content/document.mdx": srt_To_U8(model.content), //temporal "document.mdx" hasta que se agregue el soporte de múltiples documentos en .mdox
        "content/styles.json": srt_To_U8(JSON.stringify(model.styles || null, 2)),
    };
    for (const [filename, bytes] of Object.entries(model.media || {})){
        files['media/'${filename}] = bytes; //Uint8Array
    }
    for (const [filename, table_obj] of Object.entries(model.tables || {})){
        files['tables/'${filename}] = srt_To_U8(JSON.stringify(table_obj, null, 2));
    }
    return zip_sync(files,{
        mimetype:{ level: 0},
    }); //sin comprimir el mimetype, para que sea más rápido de leer y validar
}

function unpackMdox(bytes){ //recibe los bytes de un .mdox y reconstruye el modelo en memoria.
    const files = unzip_sync(bytes);
    const model = {
        metadata: JSON.parse(srt_From_U8(files['metadata.json'])),
        symbolMap: JSON.parse(srt_From_U8(files['symbolMap.json'])),
        content: srt_From_U8(files['content/document.mdx']),
        styles: files['content/styles.json']
            ? JSON.parse(srt_From_U8(files['content/styles.json']))
            :{},
        media: {},
        tables: {},
    };
    for (const [path, bytes] of Object.entries(files)){
        if (path.startsWith('media/')){
            model.media[path.slice("media/".length)] =bytes;
        }else if (path.startsWith('tables/')){
            model.tables[path.slice("tables/".length)] = JSON.parse(srt_From_U8(bytes));
        }
    }
    return model;
}

module.exports = {packMdox, unpackMdox};