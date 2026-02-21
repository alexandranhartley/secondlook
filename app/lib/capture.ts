/**
 * Shared key and helpers for passing photos between Entry, Capture, and Details.
 * Photos are stored as data URLs (base64) so they persist across client navigations.
 */

export const SESSION_PHOTOS_KEY = "secondlook_photos";
export const SESSION_PRICE_KEY = "secondlook_price";
export const SESSION_NOTES_KEY = "secondlook_notes";
export const SESSION_ANALYSIS_KEY = "secondlook_analysis";
export const MAX_PHOTOS = 3;

/** Stored value: array of data URLs (image/jpeg base64). */
export type StoredPhotos = string[];

export function getStoredPhotos(): StoredPhotos {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SESSION_PHOTOS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function setStoredPhotos(photos: StoredPhotos): void {
  if (typeof window === "undefined") return;
  try {
    const limited = photos.slice(0, MAX_PHOTOS);
    sessionStorage.setItem(SESSION_PHOTOS_KEY, JSON.stringify(limited));
  } catch {
    // ignore
  }
}

export function clearStoredPhotos(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_PHOTOS_KEY);
  } catch {
    // ignore
  }
}

/** Price storage helpers */
export function getStoredPrice(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(SESSION_PRICE_KEY) || "";
  } catch {
    return "";
  }
}

export function setStoredPrice(price: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_PRICE_KEY, price);
  } catch {
    // ignore
  }
}

export function clearStoredPrice(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_PRICE_KEY);
  } catch {
    // ignore
  }
}

/** Notes storage helpers */
export function getStoredNotes(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(SESSION_NOTES_KEY) || "";
  } catch {
    return "";
  }
}

export function setStoredNotes(notes: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_NOTES_KEY, notes);
  } catch {
    // ignore
  }
}

export function clearStoredNotes(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_NOTES_KEY);
  } catch {
    // ignore
  }
}

/** Detect if a file is HEIF/HEIC (Apple's default format; browsers can't display it natively). */
function isHeifFile(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    type === "image/heic-sequence" ||
    type === "image/heif-sequence" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

/** Turn unknown thrown values (e.g. from heic2any) into a readable error message. */
function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  if (err && typeof err === "object" && "error" in err && typeof (err as { error: unknown }).error === "string") {
    return (err as { error: string }).error;
  }
  return "Image conversion failed. Please try a different photo or format (e.g. JPEG).";
}

/** Whether the error is the known "format not supported" from older heic2any/libheif (e.g. iOS 18 HEIC). */
function isUnsupportedHeicFormatError(err: unknown): boolean {
  const msg = toErrorMessage(err).toLowerCase();
  return msg.includes("err_libheif") || msg.includes("format not supported") || msg.includes("invalid_input");
}

/** Convert a File to a data URL for sessionStorage. HEIF/HEIC files are converted to JPEG so they can be displayed in the browser. */
export async function fileToDataUrl(file: File): Promise<string> {
  // Browsers cannot display HEIF/HEIC (e.g. iPhone photos). Convert to JPEG for display and storage.
  if (typeof window !== "undefined" && isHeifFile(file)) {
    let lastErr: unknown = null;

    // Try heic2any first (widely used, works for most HEIC).
    try {
      const heic2any = (await import("heic2any")).default;
      const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
      const blob = Array.isArray(result) ? result[0] : result;
      if (!blob) throw new Error("HEIC conversion produced no image");
      return blobToDataUrl(blob);
    } catch (err) {
      lastErr = err;
      // If it's the "format not supported" error (e.g. iOS 18 HEIC), try heic-to which uses newer libheif.
      if (isUnsupportedHeicFormatError(err)) {
        try {
          const { heicTo } = await import("heic-to");
          const blob = await heicTo({ blob: file, type: "image/jpeg", quality: 0.9 });
          return blobToDataUrl(blob);
        } catch (fallbackErr) {
          lastErr = fallbackErr;
        }
      }
    }

    // Both converters failed; throw a user-friendly message.
    const msg = toErrorMessage(lastErr);
    const hint =
      "This can happen with some newer iPhone photos (iOS 18). Try \"Take with camera\" in the app, or use Settings → Camera → Formats → Most Compatible so new photos save as JPEG.";
    throw new Error(msg.includes("Image conversion failed") ? `${msg} ${hint}` : `${msg} ${hint}`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

/** Convert a Blob to a data URL for sessionStorage. */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Analysis storage helpers */
export function getStoredAnalysis(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_ANALYSIS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAnalysis(analysis: any): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_ANALYSIS_KEY, JSON.stringify(analysis));
  } catch {
    // ignore
  }
}

export function clearStoredAnalysis(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_ANALYSIS_KEY);
  } catch {
    // ignore
  }
}

/** Question answers storage helpers */
export const SESSION_INSIGHT_ANSWERS_KEY = "secondlook_insight_answers";

export type QuestionAnswer = {
  questionId: string;
  insightLabel?: string; // Optional for backward compatibility, but helpsInsights is preferred
  helpsInsights: string[]; // Array of insight labels this answer helps
  answerType: "photo" | "text";
  answered: boolean;
  answerPhoto?: string;
  answerText?: string;
};

export function getStoredInsightAnswers(): Record<string, QuestionAnswer[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(SESSION_INSIGHT_ANSWERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function setStoredInsightAnswers(answers: Record<string, QuestionAnswer[]>): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_INSIGHT_ANSWERS_KEY, JSON.stringify(answers));
  } catch {
    // ignore
  }
}

export function clearStoredInsightAnswers(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_INSIGHT_ANSWERS_KEY);
  } catch {
    // ignore
  }
}

/** Get all answered questions across all insights */
export function getAllAnsweredQuestions(): QuestionAnswer[] {
  const stored = getStoredInsightAnswers();
  const allAnswers: QuestionAnswer[] = [];
  Object.values(stored).forEach((answers) => {
    allAnswers.push(...answers.filter((a) => a.answered));
  });
  return allAnswers;
}

/** Get answered questions that help a specific insight */
export function getAnswersForInsight(insightLabel: string): QuestionAnswer[] {
  const allAnswers = getAllAnsweredQuestions();
  return allAnswers.filter(
    (answer) =>
      answer.helpsInsights?.includes(insightLabel) ||
      answer.insightLabel === insightLabel
  );
}
