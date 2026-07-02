import React, { useState } from 'react'
import { FormData } from './types'
import { generateMarkdown, renderMd } from './utils/markdown'
import { callClaudeAPI } from './utils/api'
import { Step1, Step2, Step3, Step4 } from './components/FormSteps'

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
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const [data, setData] = useState<FormData>({
    name: "", description: "", status: "active", demo: "",
    techs: [], features: [],
    prereqs: "- Node.js >= 18\n- npm ou yarn",
    install: "# Clone o repositório\ngit clone https://github.com/usuario/projeto\n\n# Instale as dependências\nnpm install",
    run: "npm run dev", screenshot: "",
  })

  const update = (key: keyof FormData, val: any) => {
    setData(d => ({ ...d, [key]: val }))
    setAiMarkdown(null)
  }

  const toggleTech = (t: string) => {
    setData(d => ({
      ...d,
      techs: d.techs.includes(t) ? d.techs.filter(x => x !== t) : [...d.techs, t]
    }))
    setAiMarkdown(null)
  }

  const addFeature = () => {
    if (!featureInput.trim()) return
    setData(d => ({ ...d, features: [...d.features, featureInput.trim()] }))
    setFeatureInput("")
    setAiMarkdown(null)
  }

  const removeFeature = (i: number) => {
    setData(d => ({ ...d, features: d.features.filter((_, idx) => idx !== i) }))
    setAiMarkdown(null)
  }

  const baseMarkdown = generateMarkdown(data)
  const displayMarkdown = aiMarkdown || baseMarkdown

  const handleAI = async () => {
    setLoading(true)
    setError(null)
    try {
      const improved = await callClaudeAPI(baseMarkdown)
      setAiMarkdown(improved)
    } catch (e: any) {
      setError(e.message || "Erro ao conectar com a IA. Tente novamente.")
    } finally {
      setLoading(false)
    }
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
        
        {/* Nova Logo Estruturada ao lado do Título */}
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
                  /* Atualizado de verde para Azul Premium (#1f6feb) ao concluir */
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 600 }}>Preview Final</h3>
                  {aiMarkdown && <span style={{ fontSize: '11px', color: 'var(--text-accent)' }}>✨ Melhorado com Claude AI</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {aiMarkdown && <button className="btn-secondary" onClick={() => setAiMarkdown(null)}>Ver Original</button>}
                  <button className="btn-secondary" onClick={copyToClipboard}>{copied ? 'Copiado!' : 'Copiar Raw'}</button>
                  {/* Botão com a nova classe Premium unificada */}
                  <button className="btn-ai-glow" onClick={handleAI} disabled={loading}>
                    {loading ? (
                      <>Processando...</>
                    ) : (
                      <>✨ Melhorar com IA</>
                    )}
                  </button>
                </div>
              </div>
              {error && <div style={{ color: '#ff4d4d', marginBottom: '10px' }}>{error}</div>}
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px' }}>
                <div dangerouslySetInnerHTML={{ __html: renderMd(displayMarkdown) }} />
              </div>
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