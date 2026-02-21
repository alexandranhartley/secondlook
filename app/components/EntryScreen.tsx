"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { fileToDataUrl, setStoredPhotos, clearStoredInsightAnswers } from "../lib/capture";
import PhotoUploadZone, { type PhotoUploadZoneRef } from "./PhotoUploadZone";

const EXAMPLES = [
  { id: "dresser", label: "Dresser", slug: "Late Victorian dresser" },
  { id: "chair", label: "Chair", slug: "Mid-century chair" },
  { id: "nightstand", label: "Nightstand", slug: "Wood nightstand" },
] as const;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () =>
      window.innerWidth < 768 ||
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(check());
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function EntryScreen() {
  const router = useRouter();
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const photoUploadRef = useRef<PhotoUploadZoneRef>(null);
  const isMobile = useIsMobile();

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      setUploadError(null);
      try {
        const urls = await Promise.all(files.map(fileToDataUrl));
        clearStoredInsightAnswers(); // New item = fresh questions on results page
        setStoredPhotos(urls);
        router.push("/details");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not process photos. Try JPEG or PNG, or take new photos with the camera.";
        setUploadError(message);
      }
    },
    [router]
  );

  const handleTapZone = useCallback(() => {
    if (isMobile) {
      setShowSourceModal(true);
    } else {
      photoUploadRef.current?.openPicker();
    }
  }, [isMobile]);

  const handleChooseGallery = useCallback(() => {
    setShowSourceModal(false);
    photoUploadRef.current?.openPicker();
  }, []);

  const handleTakeCamera = useCallback(() => {
    setShowSourceModal(false);
    router.push("/capture");
  }, [router]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background text-stone-900">
      <header className="px-5 pt-6 pb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          SecondLook
        </p>
      </header>

      <main className="flex-1 px-5 pb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          Analyze your find
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Upload up to 3 photos of wooden furniture to get expert guidance on
          your secondhand piece.
        </p>

        <section className="mt-6" aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="sr-only">
            Upload photos of your wooden furniture
          </h2>
          {uploadError && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
              {uploadError}
            </div>
          )}
          <PhotoUploadZone
            ref={photoUploadRef}
            onTapZone={isMobile ? handleTapZone : undefined}
            onFilesSelected={handleFilesSelected}
          />
        </section>

        <p className="mt-6 text-center text-xs text-stone-500">
          No photos yet? Try an example below to see how it works.
        </p>

        <section className="mt-10" aria-labelledby="examples-heading">
          <h2 id="examples-heading" className="text-sm font-semibold text-stone-700">
            Try an example:
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Wooden furniture examples to explore the app
          </p>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {EXAMPLES.map(({ id, label, slug }) => (
              <Link
                key={id}
                href={`/results?example=${id}`}
                className="flex min-w-[120px] flex-shrink-0 flex-col rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <div
                  className="aspect-square w-full rounded-t-2xl bg-gradient-to-br from-amber-100 via-stone-200 to-amber-50"
                  aria-hidden
                />
                <div className="px-3 py-3">
                  <span className="text-sm font-medium text-stone-900">
                    {label}
                  </span>
                  <p className="text-xs text-stone-500">{slug}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {showSourceModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="source-modal-title"
        >
          <div className="w-full max-w-md rounded-t-2xl bg-background p-4 pb-safe">
            <h3 id="source-modal-title" className="text-center text-sm font-semibold text-stone-700">
              Add photos
            </h3>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleTakeCamera}
                className="rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Take with camera
              </button>
              <button
                type="button"
                onClick={handleChooseGallery}
                className="rounded-xl border border-stone-300 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Choose from gallery
              </button>
              <button
                type="button"
                onClick={() => setShowSourceModal(false)}
                className="py-3 text-sm text-stone-500 hover:text-stone-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
