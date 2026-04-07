# Cortes Inteligentes 🎬

Dashboard web para **geração automática de cortes virais** de YouTube/Twitch com IA.

## Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Estilização | Tailwind CSS |
| Auth/DB | Firebase (Firestore) |
| Vídeo/Crop | Cloudinary (9:16 face tracking) |
| Transcrição | OpenAI Whisper |
| Análise IA | OpenAI GPT-4o |
| Background Jobs | Inngest (Vercel-ready) |

## Pré-requisitos

- [Node.js 18+](https://nodejs.org/)
- Conta no [Firebase](https://firebase.google.com/)
- Conta no [Cloudinary](https://cloudinary.com/)
- Conta na [OpenAI](https://platform.openai.com/)
- Conta no [Inngest](https://www.inngest.com/)

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Edite o arquivo `.env.local` e preencha todas as chaves:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}  # JSON em uma linha

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# OpenAI
OPENAI_API_KEY=sk-...

# Inngest (Necessário para Vercel)
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
```

### 3. Criar coleção no Firestore

No console do Firebase, crie uma coleção chamada `jobs`. As regras podem ser:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /jobs/{jobId} {
      allow read: if true;
      allow write: if false;  // apenas server-side via Admin SDK
    }
  }
}
```

### 4. Rodar localmente

```bash
# Terminal 1: Inngest Dev Server
npx inngest-cli@latest dev

# Terminal 2: Next.js
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Fluxo de Processamento (Inngest)

```
URL → POST /api/process → Inngest Event triggered
    → Inngest Step: Cloudinary (upload + crop 9:16)
    → Inngest Step: Whisper (transcrição com timestamps)
    → Inngest Step: GPT-4o (identifica clips virais)
    → Inngest Step: Finalize (salva no Firestore)
    ← Dashboard polling /api/status/[jobId]
```

## Como o Cloudinary faz o crop 9:16

Nenhuma linha de código de visão computacional necessária. A URL gerada inclui:
```
c_fill,g_face,h_1920,w_1080,so_<start>,eo_<end>
```
O Cloudinary usa face tracking automático para manter o rosto centralizado.
