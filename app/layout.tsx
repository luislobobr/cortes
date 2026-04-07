import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title:       'Cortes Inteligentes — Clippings Automáticos com IA',
  description: 'Gere cortes virais de YouTube e Twitch automaticamente com IA. Transcrição Whisper, análise GPT-4o e crop 9:16 via Cloudinary.',
  keywords:    ['clippings', 'youtube shorts', 'tiktok', 'ia', 'cortes automáticos'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
