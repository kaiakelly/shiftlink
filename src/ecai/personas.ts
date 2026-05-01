import type { EcaiPersona } from '@/src/ecai/types';

export const ecaiPersonas: EcaiPersona[] = [
  {
    id: 'professional',
    name: '職場專業',
    instruction: '用正式、精準、簡潔的語氣重寫，不使用表情符號。',
    emoji: 'none',
    bannedWords: [],
  },
  {
    id: 'polite',
    name: '高情商禮貌',
    instruction: '用委婉有禮的方式重寫，先肯定對方再提出需求或立場，不卑不亢。',
    emoji: 'none',
    bannedWords: [],
  },
  {
    id: 'native_en',
    name: '英文母語感',
    instruction: '若輸出為英文，避免直翻，改成更自然的英語句型與用字；保持清晰但不冗長。',
    emoji: 'none',
    bannedWords: [],
  },
  {
    id: 'casual_friend',
    name: '朋友口語',
    instruction: '用輕鬆口語、短句、自然互動的方式重寫。',
    emoji: 'light',
    bannedWords: [],
  },
  {
    id: 'empathetic',
    name: '共情支持',
    instruction: '先同理對方感受，再給出溫和建議或回覆，避免評判與指責。',
    emoji: 'light',
    bannedWords: [],
  },
  {
    id: 'romantic_flirty',
    name: '浪漫調情',
    instruction: '用帶點幽默與曖昧的語氣重寫，不要冒犯，不要過度油膩。',
    emoji: 'more',
    bannedWords: [],
  },
  {
    id: 'funny',
    name: '俏皮搞笑',
    instruction: '用活潑、有梗的方式重寫，保持友善，不要嘲諷對方。',
    emoji: 'more',
    bannedWords: [],
  },
  {
    id: 'poetic',
    name: '詩意文青',
    instruction: '用更有意象與節奏感的方式重寫，可稍微拉長，但要保留原意。',
    emoji: 'light',
    bannedWords: [],
  },
  {
    id: 'sarcastic',
    name: '毒舌諷刺',
    instruction: '用尖銳但可控的諷刺語氣重寫，避免人身攻擊與仇恨內容。',
    emoji: 'none',
    bannedWords: [],
  },
  {
    id: 'genz',
    name: 'Gen-Z',
    instruction: '用更有網感的短句與流行語重寫，保持自然，避免過度堆疊。',
    emoji: 'more',
    bannedWords: [],
  },
];

export const defaultPersonaId = ecaiPersonas[0]?.id ?? 'professional';

