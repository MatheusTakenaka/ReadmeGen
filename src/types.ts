export interface FormData {
  name: string
  description: string
  status: 'active' | 'done' | 'archived'
  demo: string
  techs: string[]
  features: string[]
  prereqs: string
  install: string
  run: string
  screenshot: string
}

export interface StepMeta {
  id: number
  label: string
}

// --- Tipos de IA ---
export type AIProviderId = 'anthropic' | 'openai' | 'gemini';

export interface AIProviderOption {
  id: AIProviderId;
  label: string;
  description: string;
}

export const AI_PROVIDERS: AIProviderOption[] = [
  { id: 'anthropic', label: 'Claude (Anthropic)', description: 'Ótimo pra texto técnico e estruturado' },
  { id: 'openai', label: 'GPT (OpenAI)', description: 'Rápido e versátil' },
  { id: 'gemini', label: 'Gemini (Google)', description: 'Boa opção gratuita' },
];