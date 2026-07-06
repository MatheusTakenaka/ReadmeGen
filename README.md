# ReadmeGen

Gerador de README profissional para projetos GitHub, com formulário guiado em etapas e melhoria opcional do texto via IA (Claude, GPT ou Gemini).

## ✨ Funcionalidades

- Formulário em 5 etapas: informações básicas, tecnologias, funcionalidades, instruções de execução e preview
- Geração automática de markdown estruturado com emojis, badges e seções padrão
- Melhoria de texto via IA com suporte a **múltiplos provedores**: Claude (Anthropic), GPT (OpenAI) e Gemini (Google)
- Backend serverless que mantém as chaves de API protegidas (nunca expostas no front-end)
- Preview em tempo real com opção de copiar o markdown gerado

## 🛠 Tecnologias

- React
- TypeScript
- Vite
- Vercel Serverless Functions (Edge Runtime)

## 🚀 Como rodar

### Pré-requisitos

- Node.js >= 18
- npm ou yarn
- [Vercel CLI](https://vercel.com/docs/cli) (necessária para rodar as funções serverless localmente)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/readme-gen

# Instale as dependências
npm install
```

### Configuração das chaves de API

Esse projeto integra três provedores de IA opcionais para a função "Melhorar com IA". Você não precisa configurar todos — apenas os que pretende usar.

Crie um arquivo `.env` na raiz do projeto com as chaves dos provedores desejados:

ANTHROPIC_API_KEY=sk-ant-... 

OPENAI_API_KEY=sk-...

GEMINI_API_KEY=...

## ⚠️ Nunca commite o arquivo `.env`. Confirme que ele está listado no `.gitignore`.

### Rodando localmente

Como o projeto usa funções serverless (pasta `api/`), o `npm run dev` sozinho **não é suficiente** — ele serve apenas o front-end via Vite e não executa as functions.

Use a Vercel CLI para simular o ambiente completo (front-end + backend):

```bash
npm install -g vercel
vercel dev
```

Na primeira execução, a CLI vai pedir login e configuração do projeto (aceite os padrões sugeridos). A aplicação ficará disponível em `http://localhost:3000`.

### Build para produção

```bash
npm run build
```

## 📦 Deploy

O projeto está pronto para deploy direto na Vercel:

```bash
vercel --prod
```

Lembre-se de configurar as variáveis de ambiente (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`) no painel do projeto na Vercel (**Settings → Environment Variables**), já que o arquivo `.env` local não é enviado no deploy.

