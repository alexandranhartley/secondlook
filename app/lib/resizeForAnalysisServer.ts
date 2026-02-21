/**
 * Server-side image resize for the analyze-item API.
 * Ensures photos sent to OpenAI stay within size limits even if the client
 * sent full-size images (e.g. resize failed in the browser). Reduces token cost.
 * Uses sharp; if sharp is not installed or resize fails, returns the original URL.
 */

const SERVER_MAX_LONG_EDGE = 768;
const SERVER_JPEG_QUALITY = 75;

/**
 * Resize a data URL image (e.g. data:image/jpeg;base64,...) for analysis.
 * Returns a new data URL with max long edge 768px and JPEG quality 75,
 * or the original string if resize fails or sharp is unavailable.
 */
export async function resizeDataUrlForAnalysisServer(
  dataUrl: string
): Promise<string> {
  if (!dataUrl?.startsWith("data:image")) {
    return dataUrl;
  }

  try {
    const sharp = (await import("sharp")).default;
    const base64Match = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
    if (!base64Match) return dataUrl;

    const inputBuffer = Buffer.from(base64Match[1], "base64");
    const image = sharp(inputBuffer);
    const meta = await image.metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const long = Math.max(w, h);

    // Skip resize if already small enough
    if (long <= SERVER_MAX_LONG_EDGE) {
      return dataUrl;
    }

    const outputBuffer = await image
      .resize(SERVER_MAX_LONG_EDGE, SERVER_MAX_LONG_EDGE, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: SERVER_JPEG_QUALITY })
      .toBuffer();

    const base64 = outputBuffer.toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return dataUrl;
  }
}
