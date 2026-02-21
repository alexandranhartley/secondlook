"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  blobToDataUrl,
  fileToDataUrl,
  setStoredPhotos,
  setStoredPrice,
  setStoredNotes,
  setStoredAnalysis,
  clearStoredInsightAnswers,
} from "../lib/capture";
import { resizeDataUrlForAnalysis } from "../lib/resizeForAnalysis";
import PhotoUploadZone, { type PhotoUploadZoneRef } from "./PhotoUploadZone";

const EXAMPLES = [
  {
    id: "dresser",
    image: "/images/example-furniture.png",
    price: "450",
    notes: "Late Victorian dresser, solid wood, seven drawers, original hardware.",
  },
  {
    id: "chair",
    image: "/images/example-chair.png",
    price: "325",
    notes: "Mid-century Wishbone-style chair, wood frame with paper cord seat.",
  },
  {
    id: "nightstand",
    image: "/images/example-nightstand.png",
    price: "175",
    notes: "Antique-style nightstand, dark wood with carved details and light top.",
  },
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
  const [exampleLoadingId, setExampleLoadingId] = useState<string | null>(null);
  const photoUploadRef = useRef<PhotoUploadZoneRef>(null);
  const isMobile = useIsMobile();

  const handleExampleClick = useCallback(
    async (exampleId: string) => {
      const example = EXAMPLES.find((e) => e.id === exampleId);
      if (!example) return;
      setExampleLoadingId(exampleId);
      clearStoredInsightAnswers();
      try {
        const res = await fetch(example.image);
        if (!res.ok) throw new Error("Failed to load example image");
        const blob = await res.blob();
        const dataUrl = await blobToDataUrl(blob);
        setStoredPhotos([dataUrl]);
        setStoredPrice(example.price);
        setStoredNotes(example.notes);
        const photosToSend = await Promise.all([resizeDataUrlForAnalysis(dataUrl)]);
        const apiRes = await fetch("/api/analyze-item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photos: photosToSend,
            price: example.price,
            notes: example.notes,
          }),
        });
        if (!apiRes.ok) {
          const err = await apiRes.json().catch(() => ({ error: "Analysis failed" }));
          throw new Error(err.error || "Analysis failed");
        }
        const analysis = await apiRes.json();
        setStoredAnalysis(analysis);
        router.push("/analyzing");
      } catch (err) {
        console.error("Example analysis error:", err);
        setUploadError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setExampleLoadingId(null);
      }
    },
    [router]
  );

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
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white text-stone-900">
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
          SecondLook
        </p>
      </header>

      <main className="flex-1 px-5 pb-10">
        <h1 className="font-title-serif text-2xl font-bold text-stone-900 sm:text-3xl">
          Analyze your find
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Upload up to 3 photos of wooden furniture to get expert guidance on
          your secondhand piece.
        </p>

        <section className="mt-10" aria-labelledby="upload-heading">
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

        <p className="mt-8 text-center text-xs text-stone-500">
          No photos yet? Try an example below to see how it works.
        </p>

        <section className="mt-5 grid grid-cols-3 gap-3" aria-label="Example furniture to try">
            {EXAMPLES.map(({ id, image }) => {
              const isLoading = exampleLoadingId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleExampleClick(id)}
                  disabled={exampleLoadingId !== null}
                  className="flex flex-col overflow-hidden rounded-[18px] bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-wait"
                  aria-label={`Try example: ${id}`}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-white">
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-contain object-center"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80" aria-hidden>
                        <svg className="h-6 w-6 animate-spin text-stone-500" fill="none" viewBox="0 0 24 24" aria-hidden>
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
        </section>
      </main>

      {showSourceModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="source-modal-title"
        >
          <div className="w-full max-w-md rounded-t-2xl bg-white p-4 pb-safe">
            <h3 id="source-modal-title" className="text-center text-sm font-semibold text-stone-700">
              Add photos
            </h3>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleTakeCamera}
                className="rounded-xl bg-stone-800 py-3 text-sm font-semibold text-white hover:bg-stone-900"
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
