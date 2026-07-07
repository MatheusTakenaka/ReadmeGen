export const config = {
  runtime: 'edge',
};

interface RequestBody {
  markdown: string;
  provider: 'anthropic' | 'openai' | 'gemini';
}

interface ProviderConfig {
  buildRequest: (prompt: string) => { url: string; headers: Record<string, string>; body: unknown };
  parseResponse: (data: any) => string;
}

const IMPROVE_INSTRUCTION = 'Você é um technical writer especializado em READMEs de projetos GitHub para desenvolvedores brasileiros. Melhore o README fornecido: reescreva a descrição para ser mais impactante e profissional, deixe as funcionalidades mais descritivas e com verbos de ação, melhore o texto geral mantendo o tom técnico. Mantenha TODA a estrutura existente (mesmas seções, mesmos emojis, mesmos blocos de código). Retorne APENAS o markdown melhorado, sem explicações e sem blocos de código extras envolvendo o conteúdo.';

const MAX_MARKDOWN_LENGTH = 8000; // ~2000 tokens, suficiente pra qualquer README gerado pelo form

const RATE_LIMIT = 5; // requisições
const RATE_WINDOW_MS = 60_000; // por minuto

const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestLog.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);

  if (recent.length >= RATE_LIMIT) {
    requestLog.set(ip, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

function buildPrompt(markdown: string): string {
  return `${IMPROVE_INSTRUCTION}\n\nMelhore este README:\n\n${markdown}`;
}

const PROVIDERS: Record<RequestBody['provider'], ProviderConfig> = {
  anthropic: {
    buildRequest: (prompt) => ({
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY as string,
        'anthropic-version': '2023-06-01',
      },
      body: {
        model: 'claude-sonnet-5',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      },
    }),
    parseResponse: (data) => data.content?.[0]?.text ?? '',
  },
  openai: {
    buildRequest: (prompt) => ({
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
      },
    }),
    parseResponse: (data) => data.choices?.[0]?.message?.content ?? '',
  },
  gemini: {
    buildRequest: (prompt) => ({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      headers: { 'Content-Type': 'application/json' },
      body: { contents: [{ parts: [{ text: prompt }] }] },
    }),
    parseResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
  },
};

async function callProvider(provider: RequestBody['provider'], prompt: string): Promise<string> {
  const config = PROVIDERS[provider];
  const { url, headers, body } = config.buildRequest(prompt);

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`${provider} error: ${response.status}`);
  }

  const data = await response.json();
  return config.parseResponse(data);
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Muitas requisições. Aguarde um momento e tente novamente.' }), {
      status: 429,
    });
  }

  try {
    const { markdown, provider }: RequestBody = await req.json();

    if (!markdown || !provider) {
      return new Response(JSON.stringify({ error: 'markdown e provider são obrigatórios' }), {
        status: 400,
      });
    }

    if (typeof markdown !== 'string' || markdown.length > MAX_MARKDOWN_LENGTH) {
      return new Response(JSON.stringify({ error: 'Conteúdo inválido ou muito longo' }), {
        status: 400,
      });
    }

    if (!PROVIDERS[provider]) {
      return new Response(JSON.stringify({ error: 'Provider inválido' }), { status: 400 });
    }

    const prompt = buildPrompt(markdown);
    const readme = await callProvider(provider, prompt);

    return new Response(JSON.stringify({ readme }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Erro ao gerar README:', err);
    return new Response(JSON.stringify({ error: 'Erro ao gerar README' }), { status: 500 });
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url, options)
    if (response.status !== 503 || attempt === retries) {
      return response
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
  }
  throw new Error('Falha após múltiplas tentativas')
}