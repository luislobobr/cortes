import OpenAI from 'openai'
import type { Clip } from '@/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function transcribeAudio(audioUrl: string): Promise<string> {
  const response = await fetch(audioUrl)
  const blob = await response.blob()
  const file = new File([blob], 'audio.mp3', { type: 'audio/mpeg' })

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  })

  return JSON.stringify(transcription)
}

interface LLMClip {
  startTime: number
  endTime: number
  title: string
  description: string
  hashtags: string[]
}

export async function analyzeTranscript(transcriptJson: string): Promise<LLMClip[]> {
  const chat = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Você é um especialista em criação de conteúdo viral para YouTube Shorts e TikTok.
Analise a transcrição fornecida (com timestamps) e identifique de 3 a 5 segmentos de maior retenção.
Para cada segmento, retorne um JSON com o formato:
{
  "clips": [
    {
      "startTime": <segundos>,
      "endTime": <segundos>,
      "title": "<título viral em até 60 caracteres>",
      "description": "<descrição engajante em até 150 caracteres>",
      "hashtags": ["<hashtag1>", "<hashtag2>", "<hashtag3>"]
    }
  ]
}
Critérios para seleção: momentos de humor, revelações, debates acalorados, picos emocionais ou informações surpresa.`,
      },
      {
        role: 'user',
        content: `Transcrição:\n${transcriptJson}`,
      },
    ],
  })

  const raw = chat.choices[0].message.content ?? '{}'
  const parsed = JSON.parse(raw)
  return (parsed.clips ?? []) as LLMClip[]
}
