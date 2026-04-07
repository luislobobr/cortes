'use client'

import type { JobStatus } from '@/types'
import { Upload, Mic, Brain, CheckCircle, XCircle } from 'lucide-react'

interface ProcessingStatusProps {
  status: JobStatus
  progress: number
  message: string
}

const STEPS = [
  { key: 'processing',   label: 'Upload',       icon: Upload },
  { key: 'transcribing', label: 'Transcrição',  icon: Mic   },
  { key: 'analyzing',    label: 'Análise IA',   icon: Brain },
  { key: 'done',         label: 'Pronto!',      icon: CheckCircle },
] as const

const ORDER: Record<string, number> = {
  pending: 0, processing: 1, transcribing: 2, analyzing: 3, done: 4, error: 4,
}

export default function ProcessingStatus({ status, progress, message }: ProcessingStatusProps) {
  const currentStep = ORDER[status] ?? 0
  const isError     = status === 'error'

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 animate-fade-in">
      {/* Progress bar */}
      <div className="relative h-2 bg-surface-700 rounded-full overflow-hidden mb-6">
        <div
          className={`
            absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out
            ${isError
              ? 'bg-red-500'
              : 'bg-gradient-to-r from-brand-500 to-brand-400'
            }
          `}
          style={{ width: `${progress}%` }}
        />
        {!isError && progress < 100 && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent to-white/20 animate-pulse-slow"
            style={{ width: `${progress}%` }}
          />
        )}
      </div>

      {/* Steps */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {STEPS.map((step, i) => {
          const done    = currentStep > i + 1 || status === 'done'
          const active  = currentStep === i + 1 && !isError
          const Icon    = step.icon

          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                ${done   ? 'bg-brand-500/20 text-brand-400'  : ''}
                ${active ? 'bg-brand-500/30 text-brand-300 ring-2 ring-brand-500/50 scale-110' : ''}
                ${!done && !active ? 'bg-surface-700 text-surface-500' : ''}
              `}>
                <Icon size={18} className={active ? 'animate-pulse' : ''} />
              </div>
              <span className={`text-xs font-medium ${active ? 'text-brand-300' : done ? 'text-surface-400' : 'text-surface-600'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Status message */}
      <p className={`text-center text-sm ${isError ? 'text-red-400' : 'text-surface-400'} flex items-center justify-center gap-2`}>
        {isError && <XCircle size={15} />}
        {message}
      </p>
    </div>
  )
}
