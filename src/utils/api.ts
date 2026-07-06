import type { AIProviderId } from '../types'

export async function generateReadme(prompt: string, provider: AIProviderId): Promise<string> {
  const response = await fetch('/api/generate-readme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, provider }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error ?? 'Falha ao gerar README')
  }

  const data = await response.json()
  return data.readme
}