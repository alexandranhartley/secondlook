/**
 * Resize a data URL image for analysis API calls to reduce payload size and
 * OpenAI image token cost. Lower maxLongEdge and quality = fewer tokens.
 * Only runs in the browser; on server or on error returns the original URL.
 */

import { blobToDataUrl } from "./capture";

const DEFAULT_MAX_LONG_EDGE = 1024;
const DEFAULT_QUALITY = 0.8;

export async function resizeDataUrlForAnalysis(
  dataUrl: string,
  options?: { maxLongEdge?: number; quality?: number }
): Promise<string> {
  const maxLongEdge = options?.maxLongEdge ?? DEFAULT_MAX_LONG_EDGE;
  const quality = options?.quality ?? DEFAULT_QUALITY;

  if (typeof window === "undefined") {
    return dataUrl;
  }

  try {
    const img = await loadImage(dataUrl);
    const { width, height } = img;
    const scale = maxLongEdge / Math.max(width, height);
    if (scale >= 1) {
      return dataUrl;
    }
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
    });
    if (!blob) return dataUrl;
    return blobToDataUrl(blob);
  } catch {
    return dataUrl;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
