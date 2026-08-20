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
    for (const [filename, bytes] of Object.entries)
}