const parser = require('@babel/parser');
const fs = require('fs');
const path = require('path');
function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules' || name === 'dist') continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.jsx') || name.endsWith('.js')) out.push(p);
  }
  return out;
}
let fails = 0;
for (const f of walk('src')) {
  const src = fs.readFileSync(f, 'utf8');
  try {
    parser.parse(src, {
      sourceType: 'module',
      plugins: ['jsx'],
    });
  } catch (e) {
    fails++;
    console.log('FAIL ' + f);
    console.log('  line ' + (e.loc && e.loc.line) + ' col ' + (e.loc && e.loc.column) + ': ' + e.message);
    const lines = src.split('\n');
    if (e.loc && e.loc.line) {
      const ln = e.loc.line;
      for (let i = Math.max(1, ln-1); i <= Math.min(lines.length, ln+1); i++) {
        const mark = i === ln ? '>>' : '  ';
        console.log('  ' + mark + ' ' + i + ': ' + lines[i-1].slice(0, 180));
      }
    }
    console.log('');
  }
}
console.log('Total fails: ' + fails);
