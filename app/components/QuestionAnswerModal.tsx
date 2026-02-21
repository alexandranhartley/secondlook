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
  insightLabel,
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
      // Stop camera
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
      alert("Please provide a photo answer");
      return;
    }
    if (question.answerType === "text" && !answerText.trim()) {
      alert("Please provide a text answer");
      return;
    }
    if (question.answerType === "either" && !answerPhoto && !answerText.trim()) {
      alert("Please provide either a photo or text answer");
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 id="question-modal-title" className="text-lg font-semibold text-stone-900 mb-2">
          {question.text}
        </h3>
        <p className="text-sm text-stone-500 mb-4">
          {insightLabel} • {question.answerType === "photo" ? "Photo answer" : question.answerType === "text" ? "Text answer" : "Photo or text answer"}
        </p>

        {needsPhoto && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Photo Answer
            </label>
            {answerPhoto ? (
              <div className="relative">
                <img
                  src={answerPhoto}
                  alt="Answer photo"
                  className="w-full rounded-lg border border-stone-200"
                />
                <button
                  type="button"
                  onClick={() => setAnswerPhoto(null)}
                  className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="sr-only"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 rounded-lg border border-stone-300 bg-white py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                  >
                    Upload Photo
                  </button>
                  {typeof navigator !== "undefined" && navigator.mediaDevices && (
                    <button
                      type="button"
                      onClick={handleCameraClick}
                      className="flex-1 rounded-lg border border-stone-300 bg-white py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                    >
                      {isCapturing ? "Stop Camera" : "Use Camera"}
                    </button>
                  )}
                </div>
                {isCapturing && videoRef && (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg border border-stone-200"
                    />
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-6 py-2 text-sm font-semibold text-stone-900 shadow-lg"
                    >
                      Capture Photo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {needsText && (
          <div className="mb-4">
            <label htmlFor="text-answer" className="block text-sm font-medium text-stone-700 mb-2">
              Text Answer
            </label>
            <textarea
              id="text-answer"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Enter your answer..."
              rows={3}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-stone-300 bg-white py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Save Answer
          </button>
        </div>
      </div>
    </div>
  );
}
