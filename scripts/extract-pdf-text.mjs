import { Buffer } from 'node:buffer';
import process from 'node:process';
import { PDFParse } from 'pdf-parse';

const chunks = [];

try {
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }

  const data = Buffer.concat(chunks);
  if (data.length === 0) {
    throw new Error('No PDF data received');
  }

  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText({ pageJoiner: '\n' });
    process.stdout.write(JSON.stringify({ text: result.text ?? '' }));
  } finally {
    await parser.destroy().catch(() => undefined);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(message);
  process.exit(1);
}
