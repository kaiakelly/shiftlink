export type EcaiAction = 'translate' | 'paraphrase' | 'proofread' | 'rewrite' | 'reply';

export type EcaiLanguage = 'zh-Hant' | 'en';

export type EcaiPersona = {
  id: string;
  name: string;
  instruction: string;
  emoji: 'none' | 'light' | 'more';
  bannedWords: string[];
};

export type EcaiResult = {
  id: string;
  title: string;
  text: string;
};

