"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { blobToDataUrl, MAX_PHOTOS, setStoredPhotos, clearStoredInsightAnswers } from "../lib/capture";

const INSTRUCTIONS = [
  "Take photo from the front",
  "Take photo from the side",
  "Take photo from the back",
] as const;

function Guardrails() {
  const w = 60;
  const t = 4;
  const r = 12;
  const cornerPath = `M 0 ${r} Q 0 0 ${r} 0 L ${w} 0 L ${w} ${t} L ${t} ${t} L ${t} ${w} L 0 ${w} Z`;
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden
    >
      <svg className="absolute left-0 top-0 h-24 w-24 text-white" viewBox={`0 0 ${w} ${w}`}>
        <path d={cornerPath} fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
      <svg className="absolute right-0 top-0 h-24 w-24 scale-x-[-1] text-white" viewBox={`0 0 ${w} ${w}`}>
        <path d={cornerPath} fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
      <svg className="absolute bottom-0 left-0 h-24 w-24 scale-y-[-1] text-white" viewBox={`0 0 ${w} ${w}`}>
        <path d={cornerPath} fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
      <svg className="absolute bottom-0 right-0 h-24 w-24 scale-x-[-1] scale-y-[-1] text-white" viewBox={`0 0 ${w} ${w}`}>
        <path d={cornerPath} fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    </div>
  );
}

export default function CaptureScreen() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [instructionIndex, setInstructionIndex] = useState(0);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.play().catch(() => {});
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.name === "NotAllowedError"
              ? "Camera access was denied."
              : "Could not open camera."
          );
        }
      });
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [stopStream]);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || photos.length >= MAX_PHOTOS) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        blobToDataUrl(blob).then((url) => {
          setPhotos((prev) => {
            const next = prev.concat(url).slice(0, MAX_PHOTOS);
            setInstructionIndex(Math.min(next.length, INSTRUCTIONS.length - 1));
            return next;
          });
        });
      },
      "image/jpeg",
      0.9
    );
  }, [photos.length]);

  const removeAt = useCallback((index: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setInstructionIndex(Math.min(next.length, INSTRUCTIONS.length - 1));
      return next;
    });
  }, []);

  const handleDone = useCallback(() => {
    clearStoredInsightAnswers(); // New item = fresh questions on results page
    setStoredPhotos(photos);
    stopStream();
    router.push("/details");
  }, [photos, router, stopStream]);

  const handleClose = useCallback(() => {
    stopStream();
    router.push("/");
  }, [router, stopStream]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1918] px-6 text-stone-100">
        <p className="text-center text-sm">{error}</p>
        <p className="mt-2 text-center text-xs text-stone-400">
          You can add photos from your gallery on the previous screen.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-6 rounded-full bg-stone-800 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-900"
        >
          Back to start
        </button>
      </div>
    );
  }

  const instruction =
    instructionIndex < INSTRUCTIONS.length
      ? INSTRUCTIONS[instructionIndex]
      : INSTRUCTIONS[INSTRUCTIONS.length - 1];

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />
      <Guardrails />

      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-black/70 px-4 py-4">
        <button
          type="button"
          onClick={handleClose}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/20"
          aria-label="Close"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <span className="text-sm font-medium text-white">
          {photos.length}/{MAX_PHOTOS} photos
        </span>
        <button
          type="button"
          onClick={handleDone}
          className="rounded-full bg-stone-800 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-900"
        >
          Done
        </button>
      </div>

      <div className="absolute left-0 right-0 top-1/2 z-10 -translate-y-1/2 px-4 text-center">
        <p className="text-lg font-medium text-white drop-shadow-lg">
          {instruction}
        </p>
        {photos.length < MAX_PHOTOS && (
          <p className="mt-1 text-xs text-stone-300">
            We recommend front, side, and back for best results.
          </p>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between gap-4 bg-black/70 px-4 pb-safe pt-4">
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {photos.map((url, i) => (
            <div key={url} className="relative flex-shrink-0">
              <img
                src={url}
                alt={`Captured ${i + 1}`}
                className="h-14 w-14 rounded-lg border border-white/30 object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
                aria-label={`Remove photo ${i + 1}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={capture}
          disabled={photos.length >= MAX_PHOTOS}
          className="mb-2 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-4 border-white bg-stone-800 text-white shadow-lg disabled:opacity-50 hover:bg-stone-900"
          aria-label="Take photo"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
