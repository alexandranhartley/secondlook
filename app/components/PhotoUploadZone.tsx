"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { MAX_PHOTOS } from "../lib/capture";

export type PhotoUploadZoneRef = { openPicker: () => void };

type PhotoUploadZoneProps = {
  /** When set, selected files are reported to parent (e.g. for navigate-to-details flow). */
  onFilesSelected?: (files: File[]) => void;
  /** When set, tapping the zone calls this instead of opening the file input (e.g. to show Camera vs Gallery on mobile). */
  onTapZone?: () => void;
};

const PhotoUploadZone = forwardRef<PhotoUploadZoneRef, PhotoUploadZoneProps>(
  function PhotoUploadZone({ onFilesSelected, onTapZone }, ref) {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const openPicker = () => inputRef.current?.click();

    useImperativeHandle(ref, () => ({ openPicker }), []);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const chosen = Array.from(e.target.files ?? []);
      const next = files
        .slice(0, MAX_PHOTOS - chosen.length)
        .concat(chosen)
        .slice(0, MAX_PHOTOS);
      e.target.value = "";

      if (onFilesSelected && next.length > 0) {
        onFilesSelected(next);
        return;
      }

      setFiles(next);
      setPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return next.map((f) => URL.createObjectURL(f));
      });
    };

    const removeAt = (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviews((prev) => {
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
    };

    const handleZoneClick = () => {
      if (onTapZone) {
        onTapZone();
        return;
      }
      openPicker();
    };

    return (
      <div className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="sr-only"
          id="photo-upload"
          aria-label="Upload up to 3 photos of wooden furniture"
        />
        <button
          type="button"
          onClick={handleZoneClick}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/80 py-10 px-4 transition-colors hover:border-stone-400 hover:bg-stone-100/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          {previews.length === 0 ? (
            <>
              <svg
                viewBox="0 0 24 24"
                className="h-12 w-12 text-stone-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="text-sm font-medium text-stone-600">
                Tap to upload photos
              </span>
              <span className="text-xs text-stone-500">
                Or take new ones with your camera
              </span>
              <span className="text-xs text-stone-400">
                Up to {MAX_PHOTOS} photos
              </span>
            </>
          ) : (
            <div className="flex w-full flex-wrap items-center justify-center gap-3">
              {previews.map((url, i) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt={`Upload ${i + 1}`}
                    className="h-20 w-20 rounded-xl border border-stone-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAt(i);
                    }}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-stone-700 text-white shadow hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {files.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPicker();
                  }}
                  className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white text-stone-400 hover:border-stone-400 hover:text-stone-600"
                  aria-label="Add another photo"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </button>
      </div>
    );
  }
);

export default PhotoUploadZone;
