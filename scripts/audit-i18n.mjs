import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const roots = ['app', 'components', 'lib'];
const sourceFiles = roots.flatMap((dir) => collect(path.join(root, dir)));
const userFacing = /(?:placeholder|aria-label|toast\.(?:error|success)|>\s*)["'`](?:[A-Za-z][^"'`]{2,})["'`]/;
const findings = sourceFiles
  .filter((file) => !file.endsWith('i18n.tsx'))
  .flatMap((file) => fs.readFileSync(file, 'utf8').split(/\r?\n/).flatMap((line, index) =>
    userFacing.test(line) ? [{ file: path.relative(root, file), line: index + 1, text: line.trim() }] : []
  ));

console.log('Localization audit');
console.log(`Scanned ${sourceFiles.length} source files.`);
if (findings.length === 0) {
  console.log('No obvious hardcoded English UI strings found by the heuristic.');
} else {
  console.log(`Found ${findings.length} likely hardcoded UI strings:`);
  for (const finding of findings) console.log(`${finding.file}:${finding.line} ${finding.text}`);
  process.exitCode = 1;
}

function collect(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collect(fullPath);
    return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}
