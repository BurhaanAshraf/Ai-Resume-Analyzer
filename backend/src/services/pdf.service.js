import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export async function extractTextFromBuffer(buffer) {
  const data = await pdfParse(buffer);
  return data.text.trim();
}
