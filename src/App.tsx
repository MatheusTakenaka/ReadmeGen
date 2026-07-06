import React, { useState } from 'react'
import { FormData } from './types'
import { generateMarkdown, renderMd } from './utils/markdown'
import { generateReadme } from './utils/api'
import { AI_PROVIDERS, type AIProviderId } from './types'
import { Step1, Step2, Step3, Step4 } from './components/FormSteps'
import { AIProviderSelector } from './components/AIProviderSelector'

const STEPS = [
  { id: 1, label: "Informações básicas" },
  { id: 2, label: "Tecnologias" },
  { id: 3, label: "Funcionalidades" },
  { id: 4, label: "Como rodar" },
  { id: 5, label: "Preview e export" },
]

export default function App() {
  const [step, setStep] = useState(1)
  const [featureInput, setFeatureInput] = useState("")
  const [aiMarkdown, setAiMarkdown] = useState<string | null>(null)
  const [aiPreview, setAiPreview] = useState<string | null>(null)
  const [editedMarkdown, setEditedMarkdown] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [provider, setProvider] = useState<AIProviderId>('anthropic')

  const [data, setData] = useState<FormData>({
    name: "", description: "", status: "active", demo: "",
    techs: [], features: [],
    prereqs: "- Node.js >= 18\n- npm ou yarn",
    install: "# Clone o repositório\ngit clone https://github.com/usuario/projeto\n\n# Instale as dependências\nnpm install",
    run: "npm run dev", screenshot: "",
  })

  const resetAiState = () => {
    setAiMarkdown(null)
    setAiPreview(null)
    setEditedMarkdown(null)
  }

  const update = (key: keyof FormData, val: any) => {
    setData(d => ({ ...d, [key]: val }))
    resetAiState()
  }

  const toggleTech = (t: string) => {
    setData(d => ({
      ...d,
      techs: d.techs.includes(t) ? d.techs.filter(x => x !== t) : [...d.techs, t]
    }))
    resetAiState()
  }

  const addFeature = () => {
    if (!featureInput.trim()) return
    setData(d => ({ ...d, features: [...d.features, featureInput.trim()] }))
    setFeatureInput("")
    resetAiState()
  }

  const removeFeature = (i: number) => {
    setData(d => ({ ...d, features: d.features.filter((_, idx) => idx !== i) }))
    resetAiState()
  }

  const baseMarkdown = generateMarkdown(data)
  const displayMarkdown = editedMarkdown ?? aiMarkdown ?? baseMarkdown

  const IMPROVE_INSTRUCTION = 'Você é um technical writer especializado em READMEs de projetos GitHub para desenvolvedores brasileiros. Melhore o README fornecido: reescreva a descrição para ser mais impactante e profissional, deixe as funcionalidades mais descritivas e com verbos de ação, melhore o texto geral mantendo o tom técnico. Mantenha TODA a estrutura existente (mesmas seções, mesmos emojis, mesmos blocos de código). Retorne APENAS o markdown melhorado, sem explicações e sem blocos de código extras envolvendo o conteúdo.'

  const handleAI = async () => {
    setLoading(true)
    setError(null)
    try {
      const prompt = `${IMPROVE_INSTRUCTION}\n\nMelhore este README:\n\n${baseMarkdown}`
      const improved = await generateReadme(prompt, provider)
      setAiPreview(improved)
    } catch (e: any) {
      setError(e.message || "Erro ao conectar com a IA. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const acceptAI = () => {
    setAiMarkdown(aiPreview)
    setEditedMarkdown(null)
    setAiPreview(null)
  }

  const discardAI = () => {
    setAiPreview(null)
  }

  const startEdit = () => {
    setDraft(displayMarkdown)
    setIsEditing(true)
  }

  const saveEdit = () => {
    setEditedMarkdown(draft)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Topbar / Header */}
      <div style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Logo estruturada ao lado do título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg 
            width="26" 
            height="26" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="var(--text-accent)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 8px var(--accent-dim))' }}
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="m10 13 2 2 4-4" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Readme<span style={{ color: 'var(--text-accent)' }}>Gen</span>
          </span>
        </div>

        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Passo {step} de 5</span>
      </div>

      {/* Main Body */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: '220px', background: 'var(--surface-1)', borderRight: '1px solid var(--border)', padding: '20px 0' }}>
          {STEPS.map(st => {
            const isDone = step > st.id
            const isActive = step === st.id
            return (
              <div
                key={st.id}
                onClick={() => isDone && setStep(st.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  cursor: isDone ? 'pointer' : 'default',
                  opacity: isActive || isDone ? 1 : 0.5,
                  background: isActive ? 'var(--accent-dim)' : 'transparent'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isDone ? '#1f6feb' : isActive ? 'var(--text-accent)' : 'var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: isDone ? '#fff' : isActive ? 'var(--background)' : '#fff',
                  fontWeight: isActive || isDone ? 600 : 400
                }}>
                  {isDone ? '✓' : st.id}
                </div>
                <span style={{ fontSize: '13px', color: isActive ? 'var(--text-accent)' : 'var(--text-primary)', fontWeight: isActive ? 500 : 400 }}>{st.label}</span>
              </div>
            )
          })}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          
          {/* Título Dinâmico de Identificação da Aba (Passos 1 a 4) */}
          {step < 5 && (
            <h2 style={{ 
              margin: '0 0 24px 0', 
              fontSize: '22px', 
              fontWeight: 600, 
              color: 'var(--text-primary)' 
            }}>
              {STEPS.find(s => s.id === step)?.label}
            </h2>
          )}

          {step === 1 && <Step1 data={data} update={update} />}
          {step === 2 && <Step2 data={data} toggleTech={toggleTech} />}
          {step === 3 && <Step3 data={data} featureInput={featureInput} setFeatureInput={setFeatureInput} addFeature={addFeature} removeFeature={removeFeature} />}
          {step === 4 && <Step4 data={data} update={update} />}
          {step === 5 && (
            <div>
              <AIProviderSelector selected={provider} onChange={setProvider} />

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', justifyContent: 'flex-end' }}>
                {!isEditing && !aiPreview && (
                  <button className="btn-secondary" onClick={startEdit} title="Editar README">✏️ Editar</button>
                )}
                {aiMarkdown && !isEditing && <button className="btn-secondary" onClick={() => { setAiMarkdown(null); setEditedMarkdown(null) }}>Ver Original</button>}
                <button className="btn-secondary" onClick={copyToClipboard}>{copied ? 'Copiado!' : 'Copiar Raw'}</button>
                <button className="btn-ai-glow" onClick={handleAI} disabled={loading}>
                  {loading ? (
                    <>Processando...</>
                  ) : (
                    <>✨ Melhorar com IA</>
                  )}
                </button>
              </div>

              {error && <div style={{ color: '#ff4d4d', marginBottom: '10px' }}>{error}</div>}

              {aiPreview ? (
                <div>
                  <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'var(--accent-dim)', border: '1px solid var(--text-accent)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-accent)' }}>
                    Compare as duas versões abaixo e escolha qual manter.
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>ORIGINAL</div>
                      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', padding: '20px', borderRadius: '8px', maxHeight: '600px', overflowY: 'auto' }}>
                        <div dangerouslySetInnerHTML={{ __html: renderMd(baseMarkdown) }} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-accent)', marginBottom: '8px' }}>✨ MELHORADO PELA IA</div>
                      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--text-accent)', padding: '20px', borderRadius: '8px', maxHeight: '600px', overflowY: 'auto' }}>
                        <div dangerouslySetInnerHTML={{ __html: renderMd(aiPreview) }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn-secondary" onClick={discardAI}>Manter original</button>
                    <button className="btn-ai-glow" onClick={acceptAI}>✓ Usar versão da IA</button>
                  </div>
                </div>
              ) : isEditing ? (
                <div>
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    className="form-input"
                    style={{
                      width: '100%',
                      minHeight: '500px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      resize: 'vertical',
                      marginBottom: '12px',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn-secondary" onClick={cancelEdit}>Cancelar</button>
                    <button className="btn-primary" onClick={saveEdit}>Salvar edição</button>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px' }}>
                  <div dangerouslySetInnerHTML={{ __html: renderMd(displayMarkdown) }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div style={{ background: 'var(--surface-1)', borderTop: '1px solid var(--border)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn-secondary" onClick={() => setStep(p => p - 1)} disabled={step === 1}>← Voltar</button>
        <button className="btn-primary" onClick={() => step < 5 && setStep(p => p + 1)} disabled={step === 5}>
          {step === 5 ? 'Pronto' : 'Próximo →'}
        </button>
      </div>
    </div>
  )
}