import { createId } from '@/src/utils/id';
import { sanitizeBannedWords } from '@/src/utils/text';
import type { EcaiAction, EcaiPersona, EcaiResult } from '@/src/ecai/types';

function normalizeSpaces(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function withEndingPunctuation(s: string): string {
  if (!s) return s;
  if (/[.!?。！？]$/.test(s)) return s;
  return `${s}。`;
}

function pickEmoji(level: EcaiPersona['emoji']): string {
  if (level === 'none') return '';
  if (level === 'light') return ' 🙂';
  return ' 😄';
}

function applyPersonaStyle(text: string, persona: EcaiPersona): string {
  let out = normalizeSpaces(text);
  if (persona.id === 'professional') out = withEndingPunctuation(out);
  if (persona.id === 'polite') out = withEndingPunctuation(`麻煩你${out.startsWith('請') ? '' : '請'}${out}`);
  if (persona.id === 'casual_friend') out = `${out}${pickEmoji(persona.emoji)}`;
  if (persona.id === 'empathetic') out = `${withEndingPunctuation(`我理解你的感受。${out}`)}${pickEmoji(persona.emoji)}`;
  if (persona.id === 'romantic_flirty') out = `${withEndingPunctuation(out)}${pickEmoji(persona.emoji)}`;
  if (persona.id === 'funny') out = `${withEndingPunctuation(out)}${pickEmoji(persona.emoji)}`;
  if (persona.id === 'poetic') out = withEndingPunctuation(`${out}，像一段剛好落在心上的風。`);
  if (persona.id === 'sarcastic') out = withEndingPunctuation(`${out}（嗯，真是太“貼心”了。）`);
  if (persona.id === 'genz') out = `${out} ${pickEmoji(persona.emoji)}`.trim();
  return sanitizeBannedWords(out, persona.bannedWords);
}

function mockTranslate(text: string): string {
  const hasCjk = /[\u4e00-\u9fff]/.test(text);
  const out = normalizeSpaces(text);
  if (hasCjk) return `Mock EN: ${out}`;
  return `Mock 中文: ${out}`;
}

function mockProofread(text: string): string {
  const out = text
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .replace(/\s+。/g, '。')
    .replace(/\s+，/g, '，');
  return withEndingPunctuation(normalizeSpaces(out));
}

function replyFromContext(context: string, length: 'short' | 'balanced' | 'detailed', persona: EcaiPersona): string {
  const base = normalizeSpaces(context || '');
  const ask = /[?？]$/.test(base) || /\b(can|could|would|should)\b/i.test(base);

  if (length === 'short') {
    const out = ask ? '可以的，我這邊會處理。' : '收到，我了解了。';
    return applyPersonaStyle(out, persona);
  }

  if (length === 'balanced') {
    const out = ask
      ? '可以的，我這邊會先處理並在完成後回覆你。'
      : '收到，我了解你的意思。我會依照你說的方向跟進。';
    return applyPersonaStyle(out, persona);
  }

  const out = ask
    ? '可以的。我會先把重點確認一下，接著開始處理；完成後我會把結果與下一步建議一併回覆你。'
    : '收到，我理解你的情況。為了確保不漏掉重點，我會先整理需求與優先順序，再開始跟進，並在有更新時第一時間告訴你。';
  return applyPersonaStyle(out, persona);
}

export function mockGenerate(params: {
  action: EcaiAction;
  input: string;
  persona: EcaiPersona;
  context?: string;
}): EcaiResult[] {
  const input = params.input.trim();
  if (!input && params.action !== 'reply') return [];

  if (params.action === 'translate') {
    return [{ id: createId('res'), title: 'Translate', text: mockTranslate(input) }];
  }

  if (params.action === 'proofread') {
    return [{ id: createId('res'), title: 'Proofread', text: mockProofread(input) }];
  }

  if (params.action === 'paraphrase') {
    const base = normalizeSpaces(input);
    return [
      { id: createId('res'), title: 'Paraphrase A', text: withEndingPunctuation(base) },
      { id: createId('res'), title: 'Paraphrase B', text: withEndingPunctuation(`換句話說，${base}`) },
      { id: createId('res'), title: 'Paraphrase C', text: withEndingPunctuation(`更簡單一點：${base}`) },
    ].map((r) => ({ ...r, text: sanitizeBannedWords(r.text, params.persona.bannedWords) }));
  }

  if (params.action === 'rewrite') {
    const styled = applyPersonaStyle(input, params.persona);
    return [
      { id: createId('res'), title: params.persona.name, text: styled },
      { id: createId('res'), title: `${params.persona.name}（更短）`, text: applyPersonaStyle(normalizeSpaces(input).slice(0, 60), params.persona) },
      { id: createId('res'), title: `${params.persona.name}（更完整）`, text: applyPersonaStyle(withEndingPunctuation(normalizeSpaces(input)), params.persona) },
    ];
  }

  const context = params.context?.trim() || input;
  return [
    { id: createId('res'), title: '簡短', text: replyFromContext(context, 'short', params.persona) },
    { id: createId('res'), title: '平衡', text: replyFromContext(context, 'balanced', params.persona) },
    { id: createId('res'), title: '詳盡', text: replyFromContext(context, 'detailed', params.persona) },
  ];
}

