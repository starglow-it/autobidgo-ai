import fs from 'fs';
import path from 'path';

export function getUploadRoot() {
  return process.env.UPLOAD_DIR || './uploads';
}

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function photosDir() {
  const dir = path.join(getUploadRoot(), 'photos');
  ensureDir(dir);
  return dir;
}

export function recordingsDir() {
  const dir = path.join(getUploadRoot(), 'recordings');
  ensureDir(dir);
  return dir;
}

export function safeBasename(originalName: string) {
  const base = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
  return base.slice(0, 120);
}
