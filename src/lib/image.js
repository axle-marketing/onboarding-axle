// Compressão de imagem no cliente (canvas) antes de enviar via base64 ao n8n.
// Reduz a maior dimensão para maxDim e re-encoda em JPEG — mantém os payloads
// pequenos sem perder qualidade perceptível para fotos de onboarding.
export async function compressImage(file, { maxDim = 1600, quality = 0.82 } = {}) {
  if (!file || !file.type?.startsWith('image/')) return file
  try {
    const img = await loadImage(file)
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
    const width = Math.round(img.width * scale)
    const height = Math.round(img.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, width, height)

    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality))
    if (!blob || blob.size >= file.size) return file // não piorar arquivos já pequenos
    const name = file.name.replace(/\.(png|webp|gif|bmp|heic|heif)$/i, '.jpg')
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    return file // se algo falhar, envia o original
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      resolve(img)
      // libera depois do load (a imagem já está decodificada)
      setTimeout(() => URL.revokeObjectURL(url), 0)
    }
    img.onerror = reject
    img.src = url
  })
}
