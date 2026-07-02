import { FormData } from '../types'

export function escHtml(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function inlineMd(text: string): string {
  return text
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" style="height:18px;vertical-align:middle;margin-right:4px">',
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--text-accent)">$1</a>',
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:500">$1</strong>')
    .replace(
      /`([^`]+)`/g,
      '<code style="background:var(--surface-0);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:12px;color:var(--text-accent)">$1</code>',
    )
}

export function renderMd(text: string): string {
  const lines = text.split('\n')
  let html = '', inCode = false, inList = false

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) {
        html += '</code></pre>'
        inCode = false
      } else {
        if (inList) { html += '</ul>'; inList = false }
        html += '<pre style="background:var(--surface-0);padding:12px 16px;border-radius:8px;font-family:var(--font-mono);font-size:12px;overflow-x:auto;margin:10px 0;border:1px solid var(--border)"><code style="color:var(--text-accent)">'
        inCode = true
      }
      continue
    }
    if (inCode) { html += escHtml(line) + '\n'; continue }

    if (line.startsWith('- ')) {
      if (!inList) { html += '<ul style="padding-left:20px;margin:8px 0">'; inList = true }
      html += `<li style="margin:3px 0;color:var(--text-primary)">${inlineMd(line.slice(2))}</li>`
      continue
    } else if (inList) { html += '</ul>'; inList = false }

    if (line.startsWith('# '))   { html += `<h1 style="font-size:22px;font-weight:500;margin:0 0 10px;color:var(--text-primary)">${inlineMd(line.slice(2))}</h1>`; continue }
    if (line.startsWith('## '))  { html += `<h2 style="font-size:17px;font-weight:500;margin:20px 0 8px;padding-bottom:6px;border-bottom:1px solid var(--border);color:var(--text-primary)">${inlineMd(line.slice(3))}</h2>`; continue }
    if (line.startsWith('### ')) { html += `<h3 style="font-size:14px;font-weight:500;margin:14px 0 6px;color:var(--text-primary)">${inlineMd(line.slice(4))}</h3>`; continue }
    if (line.startsWith('> '))   { html += `<blockquote style="border-left:3px solid var(--accent);padding:8px 14px;margin:10px 0;color:var(--text-secondary);background:var(--accent-dim);border-radius:0 6px 6px 0;font-style:italic">${inlineMd(line.slice(2))}</blockquote>`; continue }
    if (line === '---')          { html += '<hr style="border:none;border-top:1px solid var(--border);margin:18px 0">'; continue }
    if (line === '')             { html += '<div style="height:6px"></div>'; continue }
    html += `<p style="margin:3px 0;color:var(--text-primary);font-size:14px">${inlineMd(line)}</p>`
  }

  if (inList) html += '</ul>'
  if (inCode) html += '</code></pre>'
  return html
}

export function generateMarkdown(data: FormData): string {
  const { name, description, status, demo, techs, features, prereqs, install, run } = data
  const n = name || 'Meu Projeto'
  const desc = description || 'Descrição do projeto'
  const sLabel = status === 'active' ? 'Em%20Desenvolvimento' : status === 'done' ? 'Conclu%C3%ADdo' : 'Arquivado'
  const sColor = status === 'active' ? 'blue' : status === 'done' ? 'brightgreen' : 'lightgrey'

  let md = `# ${n}\n\n`
  md += `![Status](https://img.shields.io/badge/status-${sLabel}-${sColor})\n`
  if (demo) md += `![Demo](https://img.shields.io/badge/demo-online-purple)\n`
  md += `\n> ${desc}\n\n`
  if (demo) md += `**🔗 [Ver demo](${demo})**\n\n`

  if (features.length > 0) {
    md += `## ✨ Funcionalidades\n\n`
    features.forEach(f => { md += `- ${f}\n` })
    md += '\n'
  }

  if (techs.length > 0) {
    md += `## 🛠️ Tecnologias\n\n`
    techs.forEach(t => { md += `- ${t}\n` })
    md += '\n'
  }

  md += `## 🚀 Como rodar\n\n`
  if (prereqs) md += `### Pré-requisitos\n\n${prereqs}\n\n`
  if (install) md += `### Instalação\n\n\`\`\`bash\n${install}\n\`\`\`\n\n`
  if (run)     md += `### Executar\n\n\`\`\`bash\n${run}\n\`\`\`\n\n`
  md += `---\n\nFeito com ❤️ por você`
  return md
}