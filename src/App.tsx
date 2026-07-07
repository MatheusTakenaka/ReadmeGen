import { useState } from 'react'
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
    run: "npm run dev",
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

  const handleAI = async () => {
    setLoading(true)
    setError(null)
    try {
      const improved = await generateReadme(baseMarkdown, provider)
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
    <div className="app-shell">
      <div className="topbar">
        <div className="topbar-logo">
          <svg
            className="topbar-logo-icon"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="m10 13 2 2 4-4" />
          </svg>
          <span className="topbar-logo-text">
            Readme<span style={{ color: 'var(--text-accent)' }}>Gen</span>
          </span>
        </div>

        <span className="topbar-step-count">Passo {step} de 5</span>
      </div>

      <div className="main-body">
        <div className="sidebar">
          {STEPS.map(st => {
            const isDone = step > st.id
            const isActive = step === st.id
            return (
              <div
                key={st.id}
                onClick={() => isDone && setStep(st.id)}
                className={`sidebar-step ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`}
              >
                <div className={`sidebar-step-badge ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}>
                  {isDone ? '✓' : st.id}
                </div>
                <span className={`sidebar-step-label ${isActive ? 'is-active' : ''}`}>{st.label}</span>
              </div>
            )
          })}
        </div>

        <div className="content-area">
          {step < 5 && (
            <h2 className="content-title">
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

              <div className="step5-actions">
                {!isEditing && !aiPreview && (
                  <button className="btn-secondary" onClick={startEdit} title="Editar README">✏️ Editar</button>
                )}
                {aiMarkdown && !isEditing && <button className="btn-secondary" onClick={() => { setAiMarkdown(null); setEditedMarkdown(null) }}>Ver Original</button>}
                <button className="btn-secondary" onClick={copyToClipboard}>{copied ? 'Copiado!' : 'Copiar Raw'}</button>
                <button className="btn-ai-glow" onClick={handleAI} disabled={loading}>
                  {loading ? 'Processando...' : '✨ Melhorar com IA'}
                </button>
              </div>

              {error && <div className="error-message">{error}</div>}

              {aiPreview ? (
                <div>
                  <div className="ai-compare-banner">
                    Compare as duas versões abaixo e escolha qual manter.
                  </div>

                  <div className="ai-compare-grid">
                    <div className="ai-compare-col">
                      <div className="ai-compare-col-title">ORIGINAL</div>
                      <div className="ai-compare-box">
                        <div dangerouslySetInnerHTML={{ __html: renderMd(baseMarkdown) }} />
                      </div>
                    </div>
                    <div className="ai-compare-col">
                      <div className="ai-compare-col-title is-ai">✨ MELHORADO PELA IA</div>
                      <div className="ai-compare-box is-ai">
                        <div dangerouslySetInnerHTML={{ __html: renderMd(aiPreview) }} />
                      </div>
                    </div>
                  </div>

                  <div className="ai-compare-actions">
                    <button className="btn-secondary" onClick={discardAI}>Manter original</button>
                    <button className="btn-ai-glow" onClick={acceptAI}>✓ Usar versão da IA</button>
                  </div>
                </div>
              ) : isEditing ? (
                <div>
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    className="form-input edit-textarea"
                  />
                  <div className="edit-actions">
                    <button className="btn-secondary" onClick={cancelEdit}>Cancelar</button>
                    <button className="btn-primary" onClick={saveEdit}>Salvar edição</button>
                  </div>
                </div>
              ) : (
                <div className="readme-preview">
                  <div dangerouslySetInnerHTML={{ __html: renderMd(displayMarkdown) }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="footer-nav">
        <button className="btn-secondary" onClick={() => setStep(p => p - 1)} disabled={step === 1}>← Voltar</button>
        <button className="btn-primary" onClick={() => step < 5 && setStep(p => p + 1)} disabled={step === 5}>
          {step === 5 ? 'Pronto' : 'Próximo →'}
        </button>
      </div>
    </div>
  )
}