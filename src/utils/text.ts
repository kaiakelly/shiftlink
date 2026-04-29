export function sanitizeBannedWords(input: string, bannedWords: string[]): string {
  if (!input) return input;
  if (!bannedWords.length) return input;

  let out = input;
  for (const word of bannedWords) {
    const trimmed = word.trim();
    if (!trimmed) continue;
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'gi');
    out = out.replace(re, '***');
  }
  return out;
}

