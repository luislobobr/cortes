import { inngest } from "@/lib/inngest";
import { adminDb } from "@/lib/firebase-admin";
import { uploadVideoFromUrl, getClipUrl, getThumbnailUrl } from "@/lib/cloudinary";
import { transcribeAudio, analyzeTranscript } from "@/lib/openai";
import type { Job, Clip } from "@/types";

/**
 * Função Inngest que processa o vídeo em segundo plano, dividindo em etapas
 * para evitar limites de tempo (timeout) do Vercel.
 */
export const processVideo = inngest.createFunction(
  { id: "process-video-job", triggers: [{ event: "video/process" }] },
  async ({ event, step }: { event: any; step: any }) => {
    const { jobId, url } = event.data;

    const updateJob = async (id: string, data: Partial<Job>) => {
      await adminDb.collection("jobs").doc(id).update({
        ...data,
        updatedAt: Date.now(),
      });
    };

    try {
      // 1. Upload para o Cloudinary (Etapa Inicial)
      const publicId = await step.run("upload-to-cloudinary", async () => {
        await updateJob(jobId, { status: "processing", progress: 10, statusMessage: "Fazendo upload do vídeo…" });
        return await uploadVideoFromUrl(url, jobId);
      });

      // 2. Transcrição com Whisper (Etapa Secundária)
      const transcriptJson = await step.run("transcribe-audio", async () => {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const audioUrl = `https://res.cloudinary.com/${cloudName}/video/upload/fl_attachment,f_mp3/${publicId}.mp3`;

        await updateJob(jobId, { status: "transcribing", progress: 40, statusMessage: "Transcrevendo com IA (Whisper)…" });
        return await transcribeAudio(audioUrl);
      });

      // 3. Análise com GPT-4o (Etapa de Decisão)
      const llmClips = await step.run("analyze-transcript", async () => {
        await updateJob(jobId, { status: "analyzing", progress: 70, statusMessage: "Identificando melhores momentos…" });
        return await analyzeTranscript(transcriptJson);
      });

      // 4. Montagem dos Clips e Finalização
      await step.run("finalize-job", async () => {
        const clips: Clip[] = llmClips.map((c: any, i: number) => ({
          id: `${jobId}_clip_${i}`,
          startTime: c.startTime,
          endTime: c.endTime,
          title: c.title,
          description: c.description,
          hashtags: c.hashtags,
          downloadUrl: getClipUrl(publicId, c.startTime, c.endTime),
          thumbnailUrl: getThumbnailUrl(publicId, c.startTime),
          duration: c.endTime - c.startTime,
        }));

        await updateJob(jobId, { status: "done", progress: 100, statusMessage: "Cortes prontos!", clips });
      });

      return { success: true };
    } catch (err: any) {
      console.error("[Inngest Error]", err);
      // Notifica o erro no Firestore para o usuário ver no Dashboard
      await updateJob(jobId, {
        status: "error",
        progress: 0,
        statusMessage: "Erro no processamento.",
        error: String(err.message || err),
      });
      throw err; // Permite que o Inngest tente novamente se for um erro temporário
    }
  }
);
