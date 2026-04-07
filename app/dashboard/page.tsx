'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Scissors, Sparkles, Film } from 'lucide-react'
import UrlInput from '@/components/UrlInput'
import ClipCard from '@/components/ClipCard'
import ProcessingStatus from '@/components/ProcessingStatus'
import type { Job, JobStatus } from '@/types'

const POLL_INTERVAL = 3000 // ms
const DONE_STATES: JobStatus[] = ['done', 'error']

export default function DashboardPage() {
  const [job,     setJob]    = useState<Job | null>(null)
  const [loading, setLoading] = useState(false)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }, [])

  const startPolling = useCallback((jobId: string) => {
    stopPolling()
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/status/${jobId}`)
        const data = await res.json()
        setJob(data.job)
        if (DONE_STATES.includes(data.job.status)) {
          stopPolling()
          setLoading(false)
        }
      } catch { /* silently retry */ }
    }, POLL_INTERVAL)
  }, [stopPolling])

  useEffect(() => () => stopPolling(), [stopPolling])

  const handleSubmit = useCallback(async (url: string) => {
    setLoading(true)
    setJob(null)
    stopPolling()

    try {
      const res  = await fetch('/api/process', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) { throw new Error(data.error ?? 'Erro ao iniciar processamento.') }

      setJob({ id: data.jobId, url, platform: 'unknown', status: 'pending',
               progress: 0, statusMessage: 'Iniciando…', clips: [],
               createdAt: Date.now(), updatedAt: Date.now() })
      startPolling(data.jobId)
    } catch (err) {
      setLoading(false)
      setJob(prev => prev ? {
        ...prev, status: 'error', statusMessage: String(err)
      } : null)
    }
  }, [startPolling, stopPolling])

  const isProcessing = loading && job && !DONE_STATES.includes(job.status)
  const showResults  = job?.status === 'done' && job.clips.length > 0

  return (
    <main className="min-h-screen bg-surface-900 text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px]
                        bg-brand-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96
                        bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5
                          bg-brand-500/10 border border-brand-500/20 rounded-full
                          text-brand-400 text-xs font-medium">
            <Sparkles size={12} />
            Powered by GPT-4o + Whisper + Cloudinary
          </div>

          <h1 className="text-5xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-brand-400 via-white to-purple-400 bg-clip-text text-transparent">
              Cortes
            </span>{' '}
            <span className="text-white">Inteligentes</span>
          </h1>

          <p className="text-surface-400 text-lg max-w-lg mx-auto">
            Cole uma URL do YouTube ou Twitch e a IA identifica os melhores
            momentos e gera cortes virais prontos para download.
          </p>
        </header>

        {/* Input */}
        <UrlInput onSubmit={handleSubmit} loading={loading} />

        {/* Processing status */}
        {job && !showResults && (
          <ProcessingStatus
            status={job.status}
            progress={job.progress}
            message={job.statusMessage}
          />
        )}

        {/* Results grid */}
        {showResults && (
          <section className="mt-14 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Film size={20} className="text-brand-400" />
              <h2 className="text-xl font-semibold text-white">
                {job.clips.length} Cortes Gerados
              </h2>
              <span className="ml-auto text-xs text-surface-500">
                Clique em "Baixar Corte" para salvar em 9:16
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {job.clips.map((clip, i) => (
                <ClipCard key={clip.id} clip={clip} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!job && !loading && (
          <div className="mt-20 flex flex-col items-center gap-4 text-surface-600 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-surface-800 flex items-center justify-center">
              <Scissors size={36} className="text-surface-600" />
            </div>
            <p className="text-sm">Seus cortes aparecerão aqui</p>
          </div>
        )}
      </div>
    </main>
  )
}
