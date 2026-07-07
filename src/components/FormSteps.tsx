import { FormData } from '../types'

interface StepProps {
  data: FormData
  update: (key: keyof FormData, val: any) => void
}

const TECHS = [
  "React", "TypeScript", "JavaScript", "Next.js", "Vue.js", "Angular",
  "Node.js", "Express", "Python", "Java", "C#",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase",
  "Docker", "Tailwind CSS", "SCSS", "REST API", "GraphQL",
  "Git", "Vite", "Jest", "Vercel", "AWS"
]

const STATUS_OPTIONS = [
  { value: "active", label: "Em desenvolvimento", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" },
  { value: "done", label: "Concluído", color: "#4ade80", bg: "rgba(74, 222, 128, 0.15)" },
  { value: "archived", label: "Arquivado", color: "#9ca3af", bg: "rgba(156, 163, 175, 0.15)" }
] as const

export function Step1({ data, update }: StepProps) {
  return (
    <div className="step-fields">
      <div>
        <label className="form-label">Nome do projeto</label>
        <input
          type="text"
          className="form-input"
          value={data.name}
          onChange={e => update("name", e.target.value)}
          placeholder="ex: AdminFlow, MedIT, Kanban Board"
        />
      </div>

      <div>
        <label className="form-label">Descrição curta</label>
        <textarea
          className="form-input"
          value={data.description}
          onChange={e => update("description", e.target.value)}
          placeholder="Explique o projeto em 1-2 frases..."
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div>
        <label className="form-label">Status</label>
        <div className="status-options">
          {STATUS_OPTIONS.map(opt => {
            const isSelected = data.status === opt.value
            return (
              <div
                key={opt.value}
                onClick={() => update("status", opt.value)}
                className={`status-option ${isSelected ? 'is-selected' : ''}`}
                style={isSelected ? {
                  borderColor: opt.color,
                  background: opt.bg,
                  color: opt.color,
                  boxShadow: `0 0 12px ${opt.bg}`,
                } : undefined}
              >
                {opt.label}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <label className="form-label">URL do demo (opcional)</label>
        <input
          type="url"
          className="form-input"
          value={data.demo}
          onChange={e => update("demo", e.target.value)}
          placeholder="https://meu-projeto.vercel.app"
        />
      </div>
    </div>
  )
}

export function Step2({ data, toggleTech }: { data: FormData; toggleTech: (t: string) => void }) {
  return (
    <div>
      {data.techs.length > 0 && (
        <div className="selected-techs-container">
          <div className="selected-techs-title">
            {data.techs.length} selecionada{data.techs.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.techs.map(t => (
              <span key={t} onClick={() => toggleTech(t)} className="tech-badge selected">
                {t} <span className="tech-close-icon">&times;</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {TECHS.map(tech => {
          const isSelected = data.techs.includes(tech)
          return (
            <span
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`tech-badge ${isSelected ? 'selected' : 'unselected'}`}
            >
              {tech}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function Step3({ data, featureInput, setFeatureInput, addFeature, removeFeature }: { data: FormData; featureInput: string; setFeatureInput: (v: string) => void; addFeature: () => void; removeFeature: (i: number) => void }) {
  return (
    <div>
      <div className="feature-input-row">
        <input
          type="text"
          className="form-input"
          value={featureInput}
          onChange={e => setFeatureInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addFeature()}
          placeholder="ex: Autenticação com JWT, Dashboard responsivo..."
          style={{ flex: 1 }}
        />
        <button onClick={addFeature} className="btn-primary" type="button">Adicionar</button>
      </div>
      {data.features.length === 0 ? (
        <div className="feature-empty">
          Adicione as funcionalidades do projeto acima
        </div>
      ) : (
        <div className="feature-list">
          {data.features.map((f, i) => (
            <div key={i} className="feature-item">
              <span className="feature-item-text">- {f}</span>
              <button onClick={() => removeFeature(i)} className="feature-remove-btn">&times;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function Step4({ data, update }: StepProps) {
  return (
    <div className="step4-fields">
      <div>
        <label className="form-label">Pré-requisitos</label>
        <textarea
          className="form-input mono-input"
          value={data.prereqs}
          onChange={e => update("prereqs", e.target.value)}
          rows={3}
        />
      </div>
      <div>
        <label className="form-label">Passos de instalação</label>
        <textarea
          className="form-input mono-input"
          value={data.install}
          onChange={e => update("install", e.target.value)}
          rows={5}
        />
      </div>
      <div>
        <label className="form-label">Comando para executar</label>
        <input
          type="text"
          className="form-input mono-input"
          value={data.run}
          onChange={e => update("run", e.target.value)}
        />
      </div>
    </div>
  )
}