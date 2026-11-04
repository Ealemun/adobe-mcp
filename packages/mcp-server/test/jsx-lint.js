// Vérification statique du code ExtendScript (ES3) du panneau, sans Adobe :
//  - syntaxe JavaScript (parse) ;
//  - constructions absentes d'ExtendScript (let/const, =>, `…`, forEach/map, trim, Object.keys, virgule finale…) ;
//  - mots réservés utilisés comme propriété après un point (obj.default, obj.in…) ;
//  - existence des fichiers #include.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../host-cep/jsx');
const files = [];
(function walk(dir) { for (const n of readdirSync(dir)) { const p = join(dir, n); if (statSync(p).isDirectory()) walk(p); else if (/\.jsx?$/.test(n) && n !== 'json2.js') files.push(p); } })(root);

const RESERVED = 'default|in|class|delete|new|typeof|void|with|function|return|if|for|while|do|case|switch|break|continue|else|try|catch|finally|throw|var|this|instanceof|export|import|enum|extends|super|const|let|package|private|protected|public|static|yield|interface|implements';
const RULES = [
  [/\b(let|const)\s+[A-Za-z_$]/, 'let/const (utiliser var)'],
  [/=>/, 'fonction fléchée'],
  [/`/, 'template literal'],
  [/\.(forEach|map|filter|reduce|some|every|indexOf|lastIndexOf|trim|bind|isArray|keys|freeze)\s*\(/, 'méthode ES5+ (forEach/map/filter/indexOf/trim/bind/Object.keys…) : écrire une boucle'],
  [/,\s*[\]}]/, 'virgule finale dans un tableau/objet'],
  [new RegExp('\\.(' + RESERVED + ')\\b(?!\\s*:)'), 'mot réservé après un point (ES3) : utiliser obj["mot"]'],
  [/\bJSON\.(parse|stringify)\b/, null], // autorisé (json2.js), listé pour mémoire
  [/\bgetter\b|\bsetter\b|\bget\s+[a-zA-Z_$][\w$]*\s*\(\s*\)\s*\{/, 'accesseur get/set'],
  [/\bString\.prototype\.trim\b/, 'trim'],
  [/\bnew\s+Map\b|\bnew\s+Set\b|\bPromise\b/, 'Map/Set/Promise'],
  [/\?\?|\?\./, 'opérateur ?? ou ?.'],
  [/\bfinally\s*\{[^]*?\breturn\b/, null] // finally + return ok
];

let errors = 0;
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split(/\r?\n/);
  const stripped = lines.map((l) => {
    const inc = /^\s*#include\s+"([^"]+)"/.exec(l);
    if (inc && !existsSync(resolve(dirname(file), inc[1]))) { errors++; console.log(`✗ ${file}: #include introuvable ${inc[1]}`); }
    return /^\s*#(include|target|strict)\b/.test(l) ? '' : l;
  });
  const code = stripped.join('\n');
  try { new vm.Script(code, { filename: file }); }
  catch (e) { errors++; console.log(`✗ ${file}: ${e.message}`); }
  // Règles ligne par ligne, en ignorant les commentaires et le contenu des chaînes/regex de façon approximative.
  stripped.forEach((line, i) => {
    const noComment = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
    const noStrings = noComment.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g, '""').replace(/\/(?:\\.|[^\/\\\n])+\/[gimy]*/g, '/re/');
    for (const [re, msg] of RULES) {
      if (msg && re.test(noStrings)) { errors++; console.log(`✗ ${file}:${i + 1}: ${msg}\n    ${line.trim()}`); }
    }
  });
}
console.log(errors ? `\n${errors} problème(s) ES3` : `✓ ${files.length} fichiers ExtendScript : syntaxe et compatibilité ES3 ok`);
process.exit(errors ? 1 : 0);
