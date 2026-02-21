"use client";

import { useState, useRef, useCallback } from "react";
import { fileToDataUrl, blobToDataUrl } from "../lib/capture";

export type Question = {
  id: string;
  text: string;
  answerType: "photo" | "text" | "either";
};

type QuestionAnswerModalProps = {
  question: Question;
  insightLabel: string;
  onSave: (answer: { photo?: string; text?: string }) => void;
  onClose: () => void;
};

export default function QuestionAnswerModal({
  question,
  insightLabel: _insightLabel,
  onSave,
  onClose,
}: QuestionAnswerModalProps) {
  const [answerPhoto, setAnswerPhoto] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const dataUrl = await fileToDataUrl(file);
    setAnswerPhoto(dataUrl);
  }, []);

  const handleCameraClick = useCallback(async () => {
    if (isCapturing) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCapturing(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please use file upload instead.");
    }
  }, [isCapturing]);

  const handleCapturePhoto = useCallback(async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg"));
    const dataUrl = await blobToDataUrl(blob);
    setAnswerPhoto(dataUrl);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const handleSave = useCallback(() => {
    if (question.answerType === "photo" && !answerPhoto) {
      alert("Please provide a photo");
      return;
    }
    if (question.answerType === "text" && !answerText.trim()) {
      alert("Please provide an answer");
      return;
    }
    if (question.answerType === "either" && !answerPhoto && !answerText.trim()) {
      alert("Please describe or upload a photo");
      return;
    }
    onSave({
      photo: answerPhoto || undefined,
      text: answerText.trim() || undefined,
    });
    onClose();
  }, [answerPhoto, answerText, question.answerType, onSave, onClose]);

  const needsPhoto = question.answerType === "photo" || question.answerType === "either";
  const needsText = question.answerType === "text" || question.answerType === "either";
  const hasBoth = needsText && needsPhoto;

  const textPlaceholder = hasBoth
    ? "Describe the stains or upload a photo..."
    : "Enter your answer...";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        {/* Question at top: bold black, upward caret on right (collapsible hint) */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 id="question-modal-title" className="flex-1 text-base font-bold leading-snug text-stone-900">
            {question.text}
          </h3>
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 shrink-0 text-stone-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </div>

        {/* Text input when text required — light gray bg, rounded, placeholder */}
        {needsText && (
          <div className="mb-4">
            <textarea
              id="text-answer"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder={textPlaceholder}
              rows={4}
              className="w-full rounded-xl bg-stone-100 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
        )}

        {/* Upload / take photo when photo required — light gray button, camera icon + label */}
        {needsPhoto && (
          <div className="mb-5 space-y-2">
            {answerPhoto ? (
              <div className="relative rounded-xl overflow-hidden bg-stone-100">
                <img
                  src={answerPhoto}
                  alt="Your photo"
                  className="w-full rounded-xl border border-stone-200"
                />
                <button
                  type="button"
                  onClick={() => setAnswerPhoto(null)}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/70"
                  aria-label="Remove photo"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 py-3 text-base font-medium text-stone-900 hover:bg-stone-200"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-stone-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Upload Photo
            </button>
            {typeof navigator !== "undefined" && navigator.mediaDevices && (
              <button
                type="button"
                onClick={handleCameraClick}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 py-3 text-base font-medium text-stone-900 hover:bg-stone-200"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-stone-600" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                {isCapturing ? "Stop camera" : "Take photo"}
              </button>
            )}
            {isCapturing && (
              <div className="relative rounded-xl overflow-hidden bg-stone-100">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 shadow-lg"
                >
                  Capture photo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Submit to save and recalculate recommendation */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-stone-100 py-3 text-sm font-medium text-stone-700 hover:bg-stone-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-xl bg-stone-800 py-3 text-sm font-semibold text-white hover:bg-stone-900"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
