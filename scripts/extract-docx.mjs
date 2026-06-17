/**
 * Script utilitário — extrai texto puro dos arquivos `.docx` em `.projeto/`
 * e salva como `.txt` em `.projeto_extracted/`.
 *
 * Útil para indexação, busca em código e diff de versões de planejamento.
 *
 * Uso:
 *   npm run docs:extract
 *   # ou
 *   bun run docs:extract
 *   # ou diretamente
 *   node scripts/extract-docx.mjs
 *   bun run scripts/extract-docx.mjs
 */
import mammoth from 'mammoth';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projetoDir = path.resolve(__dirname, '..', '.projeto');
const outDir = path.resolve(__dirname, '..', '.projeto_extracted');

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const files = await fs.readdir(projetoDir);
  const docxFiles = files.filter((f) => f.toLowerCase().endsWith('.docx'));

  console.log(`Encontrados ${docxFiles.length} arquivos .docx em ${projetoDir}`);

  for (const f of docxFiles) {
    const full = path.join(projetoDir, f);
    const result = await mammoth.extractRawText({ path: full });
    const outName = f.replace(/\.docx$/i, '.txt');
    await fs.writeFile(path.join(outDir, outName), result.value, 'utf8');
    console.log(`  ✓ ${f}  →  ${outName}  (${result.value.length} chars)`);
  }

  console.log(`\nConcluído. Arquivos em: ${outDir}`);
}

main().catch((e) => {
  console.error('Erro ao extrair documentos:', e);
  process.exit(1);
});
