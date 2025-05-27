import * as fs from 'fs';

export function fileToString(path: string): string {
  try {
    if (!fs.existsSync(path)) {
      throw new Error(`Plantilla no encontrada`);
    }

    return fs.readFileSync(path, { encoding: 'utf8' });
  } catch (err) {
    console.error('Error reading file:', err);
  }
}
