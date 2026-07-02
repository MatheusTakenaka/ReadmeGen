import React from 'react'
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

export function Step1({ data, update }: StepProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Campo: Nome do Projeto */}
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

      {/* Campo: Descrição Curta */}
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

      {/* Campo: Status (Com as cores customizadas) */}
      <div>
        <label className="form-label">Status</label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { value: "active", label: "Em desenvolvimento", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" },
            { value: "done", label: "Concluído", color: "#4ade80", bg: "rgba(74, 222, 128, 0.15)" },
            { value: "archived", label: "Arquivado", color: "#9ca3af", bg: "rgba(156, 163, 175, 0.15)" }
          ].map(opt => {
            const isSelected = data.status === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => update("status", opt.value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.2s ease',
                  border: isSelected ? `1px solid ${opt.color}` : '1px solid var(--border)',
                  background: isSelected ? opt.bg : 'var(--surface-0)',
                  color: isSelected ? opt.color : 'var(--text-primary)',
                  boxShadow: isSelected ? `0 0 12px ${opt.bg}` : 'none'
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Campo: URL do Demo */}
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
  );
}

export function Step2({ data, toggleTech }: { data: FormData; toggleTech: (t: string) => void }) {
  return (
    <div>
      {/* Caixa Superior: Apenas as selecionadas */}
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

      {/* Lista Inferior: Todas as opções disponíveis */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {TECHS.map(tech => {
          const isSelected = data.techs.includes(tech);
          return (
            <span
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`tech-badge ${isSelected ? 'selected' : 'unselected'}`}
            >
              {tech}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function Step3({ data, featureInput, setFeatureInput, addFeature, removeFeature }: { data: FormData; featureInput: string; setFeatureInput: (v: string) => void; addFeature: () => void; removeFeature: (i: number) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
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
        <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '6px', color: 'var(--text-secondary)' }}>
          Adicione as funcionalidades do projeto acima
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <span style={{ fontSize: '13px' }}>- {f}</span>
              <button onClick={() => removeFeature(i)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function Step4({ data, update }: StepProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label className="form-label">Pré-requisitos</label>
        <textarea
          className="form-input"
          value={data.prereqs}
          onChange={e => update("prereqs", e.target.value)}
          rows={3}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
        />
      </div>
      <div>
        <label className="form-label">Passos de instalação</label>
        <textarea
          className="form-input"
          value={data.install}
          onChange={e => update("install", e.target.value)}
          rows={5}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
        />
      </div>
      <div>
        <label className="form-label">Comando para executar</label>
        <input
          type="text"
          className="form-input"
          value={data.run}
          onChange={e => update("run", e.target.value)}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
        />
      </div>
    </div>
  )
}