const fs = require('fs');
const {load_symbols_table} = require('../mdox/configloader.js');
const {tokenize} = require('../mdox/tokenizer.js');
const {serialize} = require('../mdox/serializer.js');
const {parse} = require('../mdox/parser.js');

const configPath = require('path').resolve(__dirname, '../config/configmdox.json');
const configmdox = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const symbol_table = load_symbols_table(configmdox);

const cases = [
    "Texto normal sin nada especial.",
    "】Texto en negrita】 y texto normal.",
    "】Negrita con 【cursiva anidada correctamente【 dentro】",
    "〒red〩Este texto es rojo〒 y este no.",
    "】Negrita que contiene 〒blue〩texto azul〒 y sigue en negrita】",
    "〻20〹Texto con tamaño 20〻 normal después.",
    "Precio: 20% de descuento (el símbolo % no está definido, debe quedar intacto).",
    "Escapando un símbolo literal: 〽〽】 esto no debería abrir negrita.",
    "〠yellow〨Fondo amarillo〠 normal.",
];

let all_passed = true;

for (const text of cases){
    const tokens = tokenize(text, symbol_table);
    const ast = parse(tokens);
    const rebuild = serialize(ast, symbol_table);
    const passed = rebuild === text;

    if (!passed) all_passed = false;
    console.log(passed ? ":)" : ":C", JSON.stringify(text));
    if (!passed){
        console.log(" esperado", JSON.stringify(text));
        console.log(" reconstruido", JSON.stringify(rebuild));
    }
    if (tokens.warnings){
        console.log("Warnings:", tokens.warnings.join(", "));
    }
}

console.log("\n--- AST de ejemplo (caso con parámetro anidado) ---")
const sample = "】Negrita con 〒blue〩texto azul〒 y sigue en negrita】";
console.log(JSON.stringify(parse(tokenize(sample, symbol_table)), null, 2));

console.log(all_passed ? "\nTodos los casos pasaron." : "\nAlgunos casos fallaron.");