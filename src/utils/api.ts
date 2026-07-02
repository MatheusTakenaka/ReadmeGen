export async function callClaudeAPI(markdown: string): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('Chave da API não encontrada. Crie um arquivo .env com VITE_ANTHROPIC_API_KEY.')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system:
        'Você é um technical writer especializado em READMEs de projetos GitHub para desenvolvedores brasileiros. Melhore o README fornecido: reescreva a descrição para ser mais impactante e profissional, deixe as funcionalidades mais descritivas e com verbos de ação, melhore o texto geral mantendo o tom técnico. Mantenha TODA a estrutura existente (mesmas seções, mesmos emojis, mesmos blocos de código). Retorne APENAS o markdown melhorado, sem explicações e sem blocos de código extras envolvendo o conteúdo.',
      messages: [{ role: 'user', content: `Melhore este README:\n\n${markdown}` }],
    }),
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message)
  }

  return data.content[0].text as string
}