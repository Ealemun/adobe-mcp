// Lecture robuste d'un fichier produit par une application Adobe (peut être encore verrouillé quelques instants).
import { readFile, stat } from 'node:fs/promises';

const RETRYABLE = new Set(['EBUSY', 'EPERM', 'EACCES', 'ENOENT']);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function readFileRetry(path, { timeoutMs = 8000, stepMs = 200 } = {}) {
  const t0 = Date.now();
  let lastErr;
  while (Date.now() - t0 < timeoutMs) {
    try {
      const { size } = await stat(path);
      if (size > 0) return await readFile(path);
    } catch (e) {
      if (!RETRYABLE.has(e.code)) throw e;
      lastErr = e;
    }
    await sleep(stepMs);
  }
  throw lastErr || Object.assign(new Error(`Fichier vide ou introuvable : ${path}`), { code: 'FILE_NOT_READY' });
}

/** Contenu MCP image (+ texte) pour un PNG exporté. */
export async function imageContent(result, { inline = true, maxBytes = 4_500_000 } = {}) {
  const content = [{ type: 'text', text: JSON.stringify(result) }];
  if (!inline) return { content };
  const data = await readFileRetry(result.path);
  if (data.length <= maxBytes) content.push({ type: 'image', data: data.toString('base64'), mimeType: 'image/png' });
  else content[0].text += `\nImage trop lourde pour être renvoyée en ligne (${data.length} octets) : ouvrir le fichier.`;
  return { content };
}
