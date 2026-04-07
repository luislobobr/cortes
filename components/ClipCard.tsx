'use client'

import Image from 'next/image'
import { Download, Clock, Hash } from 'lucide-react'
import type { Clip } from '@/types'

interface ClipCardProps {
  clip: Clip
  index: number
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ClipCard({ clip, index }: ClipCardProps) {
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href     = clip.downloadUrl
    a.download = `${clip.title.replace(/\s+/g, '_')}.mp4`
    a.target   = '_blank'
    a.click()
  }

  return (
    <div
      className="group relative bg-surface-800 border border-surface-700 rounded-2xl overflow-hidden
                 hover:border-brand-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10
                 animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] max-h-72 w-full bg-surface-900 overflow-hidden">
        <Image
          src={clip.thumbnailUrl}
          alt={clip.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5
                        bg-black/70 backdrop-blur-sm rounded-full text-xs text-white">
          <Clock size={11} />
          {formatDuration(clip.duration)}
        </div>
        {/* Clip number */}
        <div className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center
                        bg-brand-500 rounded-full text-xs font-bold text-white">
          {index + 1}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
          {clip.title}
        </h3>

        <p className="text-xs text-surface-400 leading-relaxed line-clamp-2">
          {clip.description}
        </p>

        {/* Hashtags */}
        {clip.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {clip.hashtags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-2 py-0.5
                           bg-brand-500/10 text-brand-400 rounded-full text-xs"
              >
                <Hash size={10} />
                {tag.replace(/^#/, '')}
              </span>
            ))}
          </div>
        )}

        {/* Download button */}
        <button
          id={`download-clip-${index}`}
          onClick={handleDownload}
          className="
            mt-1 w-full flex items-center justify-center gap-2
            py-2.5 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-brand-500 to-brand-600
            hover:from-brand-600 hover:to-brand-700
            text-white transition-all duration-200
            shadow-md shadow-brand-500/20
          "
        >
          <Download size={15} />
          Baixar Corte
        </button>
      </div>
    </div>
  )
}
