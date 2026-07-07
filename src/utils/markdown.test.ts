import { describe, it, expect } from 'vitest'
import { generateMarkdown, escHtml, inlineMd, renderMd } from './markdown'
import type { FormData } from '../types'

const baseData: FormData = {
  name: 'Meu Projeto',
  description: 'Uma descrição de teste',
  status: 'active',
  demo: '',
  techs: [],
  features: [],
  prereqs: '',
  install: '',
  run: '',
}

describe('generateMarkdown', () => {
  it('usa valores padrão quando nome e descrição estão vazios', () => {
    const md = generateMarkdown({ ...baseData, name: '', description: '' })
    expect(md).toContain('# Meu Projeto')
    expect(md).toContain('> Descrição do projeto')
  })

  it('inclui link de demo quando fornecido', () => {
    const md = generateMarkdown({ ...baseData, demo: 'https://exemplo.com' })
    expect(md).toContain('[Ver demo](https://exemplo.com)')
    expect(md).toContain('demo-online-purple')
  })

  it('omite seção de demo quando não fornecido', () => {
    const md = generateMarkdown(baseData)
    expect(md).not.toContain('Ver demo')
  })

  it('lista funcionalidades quando presentes', () => {
    const md = generateMarkdown({ ...baseData, features: ['Login', 'Dashboard'] })
    expect(md).toContain('- Login')
    expect(md).toContain('- Dashboard')
  })

  it('lista tecnologias quando presentes', () => {
    const md = generateMarkdown({ ...baseData, techs: ['React', 'TypeScript'] })
    expect(md).toContain('- React')
    expect(md).toContain('- TypeScript')
  })

  it('reflete o status corretamente no badge', () => {
    const done = generateMarkdown({ ...baseData, status: 'done' })
    expect(done).toContain('Conclu%C3%ADdo')
    expect(done).toContain('brightgreen')

    const archived = generateMarkdown({ ...baseData, status: 'archived' })
    expect(archived).toContain('Arquivado')
    expect(archived).toContain('lightgrey')
  })
})

describe('escHtml', () => {
  it('escapa caracteres HTML perigosos', () => {
    expect(escHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    )
  })

  it('escapa aspas e apóstrofos', () => {
    expect(escHtml(`"teste" 'aspas'`)).toBe('&quot;teste&quot; &#39;aspas&#39;')
  })
})

describe('inlineMd', () => {
  it('converte negrito para <strong>', () => {
    expect(inlineMd('**texto**')).toContain('<strong')
    expect(inlineMd('**texto**')).toContain('texto</strong>')
  })

  it('converte código inline para <code>', () => {
    expect(inlineMd('`npm install`')).toContain('<code')
    expect(inlineMd('`npm install`')).toContain('npm install</code>')
  })

  it('escapa HTML malicioso antes de aplicar formatação', () => {
    const result = inlineMd('<img src=x onerror=alert(1)>**bold**')
    expect(result).not.toContain('<img src=x onerror')
    expect(result).toContain('&lt;img')
  })
})

describe('renderMd', () => {
  it('renderiza título de nível 1', () => {
    expect(renderMd('# Título')).toContain('<h1')
  })

  it('renderiza lista com itens', () => {
    const html = renderMd('- item 1\n- item 2')
    expect(html).toContain('<ul')
    expect(html).toContain('<li')
    expect((html.match(/<li/g) || []).length).toBe(2)
  })

  it('renderiza bloco de código preservando o conteúdo', () => {
    const html = renderMd('```\nconst x = 1\n```')
    expect(html).toContain('<pre')
    expect(html).toContain('const x = 1')
  })

  it('não interpreta markdown dentro de bloco de código', () => {
    const html = renderMd('```\n**não deve virar negrito**\n```')
    expect(html).not.toContain('<strong')
  })
})