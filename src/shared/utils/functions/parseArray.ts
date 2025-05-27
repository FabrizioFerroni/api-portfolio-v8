export function parseSafeArray(value: string | undefined): string[] {
  if (!value) return [];

  let cleaned = value.trim().replace(/^['"]|['"]$/g, '');

  cleaned = cleaned.replace(/\\"/g, '"');

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Error parsing RABBITMQ_COLAS:', cleaned);
    throw err;
  }
}
