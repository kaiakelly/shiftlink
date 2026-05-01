import http from 'node:http';
import { URL } from 'node:url';

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(data);
}

function requestId() {
  return `req_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function resultId() {
  return `res_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeSpaces(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

function withEndingPunctuation(s) {
  const t = String(s || '').trim();
  if (!t) return t;
  if (/[.!?。！？]$/.test(t)) return t;
  return `${t}。`;
}

function applyPersonaStyle(text, persona) {
  const p = persona?.id || 'professional';
  let out = normalizeSpaces(text);
  if (p === 'professional') out = withEndingPunctuation(out);
  if (p === 'polite') out = withEndingPunctuation(`麻煩你${out.startsWith('請') ? '' : '請'}${out}`);
  if (p === 'empathetic') out = withEndingPunctuation(`我理解你的感受。${out}`);
  return out;
}

function generate({ action, input, context, persona }) {
  const text = normalizeSpaces(input);
  const ctx = normalizeSpaces(context || input);

  if (action === 'translate') {
    const hasCjk = /[\u4e00-\u9fff]/.test(text);
    const out = hasCjk ? `Mock EN: ${text}` : `Mock 中文: ${text}`;
    return [{ id: resultId(), title: 'Translate', text: out }];
  }

  if (action === 'proofread') {
    return [{ id: resultId(), title: 'Proofread', text: withEndingPunctuation(text) }];
  }

  if (action === 'paraphrase') {
    return [
      { id: resultId(), title: 'Paraphrase A', text: withEndingPunctuation(text) },
      { id: resultId(), title: 'Paraphrase B', text: withEndingPunctuation(`換句話說，${text}`) },
      { id: resultId(), title: 'Paraphrase C', text: withEndingPunctuation(`更簡單一點：${text}`) },
    ];
  }

  if (action === 'rewrite') {
    return [
      { id: resultId(), title: persona?.name || 'Persona', text: applyPersonaStyle(text, persona) },
      { id: resultId(), title: `${persona?.name || 'Persona'}（更短）`, text: applyPersonaStyle(text.slice(0, 60), persona) },
      { id: resultId(), title: `${persona?.name || 'Persona'}（更完整）`, text: applyPersonaStyle(withEndingPunctuation(text), persona) },
    ];
  }

  return [
    { id: resultId(), title: '簡短', text: applyPersonaStyle('收到，我了解了。', persona) },
    { id: resultId(), title: '平衡', text: applyPersonaStyle('收到，我了解你的意思。我會依照你說的方向跟進。', persona) },
    { id: resultId(), title: '詳盡', text: applyPersonaStyle('收到，我理解你的情況。我會先整理重點與下一步，再跟進並回覆你。', persona) },
  ];
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method !== 'POST' || url.pathname !== '/v1/generate') {
    json(res, 404, { requestId: requestId(), error: { code: 'NOT_FOUND', message: 'Not Found' } });
    return;
  }

  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
    if (raw.length > 2_000_000) req.destroy();
  });

  req.on('end', () => {
    const rid = requestId();
    let body;
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      json(res, 400, { requestId: rid, error: { code: 'INVALID_REQUEST', message: 'Invalid JSON' } });
      return;
    }

    const action = body?.action;
    if (!action) {
      json(res, 400, { requestId: rid, error: { code: 'INVALID_REQUEST', message: 'action is required' } });
      return;
    }

    const results = generate({
      action,
      input: body?.input || '',
      context: body?.context || '',
      persona: body?.persona || null,
    });

    json(res, 200, {
      requestId: rid,
      results,
      usage: {
        estimatedCredits: action === 'reply' ? 3 : action === 'rewrite' ? 2 : action === 'paraphrase' ? 2 : 1,
        model: 'mock',
      },
    });
  });
});

const port = Number(process.env.PORT || 8787);
server.listen(port, () => {
  process.stdout.write(`ECAI mock server listening on http://localhost:${port}\n`);
});

