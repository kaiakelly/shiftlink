import type { EcaiAction, EcaiPersona, EcaiResult } from '@/src/ecai/types';

export type EcaiGenerateRequest = {
  action: EcaiAction;
  input: string;
  context?: string;
  sourceLanguage?: 'auto' | 'zh-Hant' | 'en';
  targetLanguage?: 'zh-Hant' | 'en';
  persona?: EcaiPersona;
};

export type EcaiGenerateResponse = {
  requestId: string;
  results: EcaiResult[];
  usage?: {
    estimatedCredits?: number;
    model?: string;
  };
};

export async function generateViaApi(params: {
  baseUrl: string;
  request: EcaiGenerateRequest;
  timeoutMs?: number;
}): Promise<EcaiGenerateResponse> {
  const controller = new AbortController();
  const timeoutMs = params.timeoutMs ?? 15000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${params.baseUrl.replace(/\/$/, '')}/v1/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        ...params.request,
        client: { app: 'ECAIKeyboard', platform: 'web', version: '0.1.0' },
      }),
      signal: controller.signal,
    });

    const json = (await res.json()) as any;
    if (!res.ok) {
      const message = json?.error?.message || `HTTP ${res.status}`;
      throw new Error(message);
    }
    return json as EcaiGenerateResponse;
  } finally {
    clearTimeout(timer);
  }
}

