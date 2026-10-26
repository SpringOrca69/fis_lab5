import { BarcodeDetector } from 'barcode-detector/ponyfill'

/** Reads a QR code from a picked image file. Returns its text, or null if none was found. */
export async function decodeImage(file: File): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(file)
    const codes = await new BarcodeDetector({ formats: ['qr_code'] }).detect(bitmap)
    bitmap.close?.()
    return codes[0]?.rawValue ?? null
  } catch {
    return null
  }
}
