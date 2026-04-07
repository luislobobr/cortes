import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { inngest } from '@/lib/inngest'
import type { Job } from '@/types'

const YT_REGEX    = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}/
const TWITCH_REGEX = /^(https?:\/\/)?(www\.)?twitch\.tv\/.+/

function detectPlatform(url: string): Job['platform'] {
  if (YT_REGEX.test(url))     return 'youtube'
  if (TWITCH_REGEX.test(url)) return 'twitch'
  return 'unknown'
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL inválida.' }, { status: 400 })
    }

    const platform = detectPlatform(url)
    if (platform === 'unknown') {
      return NextResponse.json({ error: 'URL deve ser do YouTube ou Twitch.' }, { status: 400 })
    }

    // 1. Cria o job no Firestore para polling do frontend
    const jobRef = adminDb.collection('jobs').doc()
    const job: Job = {
      id:            jobRef.id,
      url,
      platform,
      status:        'pending',
      progress:      0,
      statusMessage: 'Iniciando processamento…',
      clips:         [],
      createdAt:     Date.now(),
      updatedAt:     Date.now(),
    }
    await jobRef.set(job)

    // 2. Dispara o evento para o Inngest (Background Processor)
    // Isso evita o timeout de 10s do Vercel Free.
    await inngest.send({
      name: "video/process",
      data: {
        jobId: jobRef.id,
        url,
      },
    });

    return NextResponse.json({ jobId: jobRef.id, status: 'pending' })
  } catch (err) {
    console.error('[/api/process]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

