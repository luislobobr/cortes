'use client'

import { useState, useCallback } from 'react'
import { Scissors, Youtube, Tv, Loader2, AlertCircle } from 'lucide-react'

interface UrlInputProps {
  onSubmit: (url: string) => void
  loading: boolean
}

const YT_RE    = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]{11}/
const TWITCH_RE = /^(https?:\/\/)?(www\.)?twitch\.tv\/.+/

export default function UrlInput({ onSubmit, loading }: UrlInputProps) {
  const [url,   setUrl]   = useState('')
  const [error, setError] = useState('')

  const platform = YT_RE.test(url) ? 'youtube' : TWITCH_RE.test(url) ? 'twitch' : null

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) { setError('Cole uma URL do YouTube ou Twitch.'); return }
    if (!platform)   { setError('URL inválida. Use links do YouTube ou Twitch.'); return }
    setError('')
    onSubmit(url.trim())
  }, [url, platform, onSubmit])

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative">
        {/* Platform icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500">
          {platform === 'youtube' && <Youtube size={20} className="text-red-400" />}
          {platform === 'twitch'  && <Tv       size={20} className="text-purple-400" />}
          {!platform              && <Scissors size={20} className="text-surface-500" />}
        </div>

        <input
          id="url-input"
          type="url"
          value={url}
          onChange={e => { setUrl(e.target.value); setError('') }}
          placeholder="Cole a URL do YouTube ou Twitch aqui…"
          disabled={loading}
          className="
            w-full pl-12 pr-44 py-4 rounded-2xl text-sm
            bg-surface-700 border border-surface-600
            text-white placeholder-surface-500
            focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
            disabled:opacity-50 transition-all duration-200
          "
        />

        <button
          id="generate-btn"
          type="submit"
          disabled={loading || !url}
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            px-5 py-2.5 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-brand-500 to-brand-600
            hover:from-brand-600 hover:to-brand-700
            disabled:opacity-40 disabled:cursor-not-allowed
            text-white transition-all duration-200
            flex items-center gap-2 shadow-lg shadow-brand-500/25
          "
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Processando…</>
            : <><Scissors size={16} /> Gerar Cortes</>
          }
        </button>
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400 animate-fade-in">
          <AlertCircle size={13} /> {error}
        </p>
      )}

      <p className="mt-2 text-center text-xs text-surface-500">
        Suporta YouTube (watch, shorts) e Twitch VODs
      </p>
    </form>
  )
}
