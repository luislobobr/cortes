import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { Job } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await params
    const snap = await adminDb.collection('jobs').doc(jobId).get()

    if (!snap.exists) {
      return NextResponse.json({ error: 'Job não encontrado.' }, { status: 404 })
    }

    return NextResponse.json({ job: snap.data() as Job })
  } catch (err) {
    console.error('[/api/status]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
