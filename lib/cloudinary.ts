const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? ''

/**
 * Gera URL de transformação Cloudinary para crop 9:16 com face tracking.
 * Não precisa de SDK — só string manipulation.
 */
export function getClipUrl(publicId: string, startOffset: number, endOffset: number): string {
  const transformation = [
    'c_fill',
    'g_face',
    'h_1920',
    'w_1080',
    'q_auto',
    'f_mp4',
    `so_${startOffset}`,
    `eo_${endOffset}`,
  ].join(',')

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformation}/${publicId}.mp4`
}

/**
 * Gera URL de thumbnail para um clip.
 */
export function getThumbnailUrl(publicId: string, startOffset: number): string {
  const transformation = [
    'c_fill',
    'g_face',
    'h_1920',
    'w_1080',
    'q_auto',
    'f_jpg',
    `so_${startOffset}`,
  ].join(',')

  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformation}/${publicId}.jpg`
}

/**
 * Upload de vídeo via URL remota (sem baixar localmente).
 * Retorna o publicId no Cloudinary.
 */
export async function uploadVideoFromUrl(videoUrl: string, jobId: string): Promise<string> {
  const { v2: cloudinary } = await import('cloudinary')

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const result = await cloudinary.uploader.upload(videoUrl, {
    resource_type: 'video',
    public_id:     `cortes/${jobId}`,
    overwrite:     true,
  })

  return result.public_id
}
