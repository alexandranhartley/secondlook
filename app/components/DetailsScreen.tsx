"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fileToDataUrl,
  getStoredPhotos,
  MAX_PHOTOS,
  setStoredPhotos,
  setStoredPrice,
  setStoredNotes,
  setStoredAnalysis,
} from "../lib/capture";
import { resizeDataUrlForAnalysis } from "../lib/resizeForAnalysis";

export default function DetailsScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPhotos(getStoredPhotos());
  }, []);

  const persistPhotos = useCallback((next: string[]) => {
    setPhotos(next);
    setStoredPhotos(next);
  }, []);

  const removePhoto = useCallback(
    (index: number) => {
      const next = photos.filter((_, i) => i !== index);
      persistPhotos(next);
    },
    [photos, persistPhotos]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = "";
      if (files.length === 0) return;
      const urls = await Promise.all(files.map(fileToDataUrl));
      const next = photos.concat(urls).slice(0, MAX_PHOTOS);
      persistPhotos(next);
    },
    [photos, persistPhotos]
  );

  const addPhoto = () => fileInputRef.current?.click();

  const handleAnalyze = useCallback(async () => {
    if (photos.length === 0) return;
    
    setIsAnalyzing(true);
    
    // Persist price and notes to sessionStorage
    setStoredPrice(price);
    setStoredNotes(notes);
    
    try {
      // Resize photos for analysis to reduce payload and API cost (keeps full-res in UI)
      const photosToSend = await Promise.all(
        photos.map((url) => resizeDataUrlForAnalysis(url))
      );
      const response = await fetch("/api/analyze-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos: photosToSend,
          price,
          notes,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to analyze" }));
        console.error("Analysis error:", error);
        // Fall back to mock data if API fails
        router.push("/analyzing");
        return;
      }
      
      const analysis = await response.json();
      
      // Store analysis result
      setStoredAnalysis(analysis);
      
      // Navigate to analyzing screen (which will use the stored analysis)
      router.push("/analyzing");
    } catch (err) {
      console.error("Failed to call analyze API:", err);
      // Fall back to analyzing screen with mock data
      router.push("/analyzing");
    } finally {
      setIsAnalyzing(false);
    }
  }, [router, photos, price, notes]);

  const canAnalyze = photos.length >= 1;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background text-stone-900">
      <header className="px-5 pt-6 pb-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          SecondLook
        </p>
      </header>

      <main className="px-5 pb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Tell us more
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Add details to help our AI advisor give you the best guidance.
        </p>

        <section className="mt-6" aria-labelledby="photos-heading">
          <h2 id="photos-heading" className="sr-only">
            Your photos
          </h2>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Add more photos"
          />
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100"
              >
                {photos[i] ? (
                  <div className="relative h-full w-full">
                    <img
                      src={photos[i]}
                      alt={`Photo ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
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
                ) : (
                  <button
                    type="button"
                    onClick={addPhoto}
                    className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/80 text-stone-400 hover:border-stone-400 hover:text-stone-600"
                    aria-label="Add photo"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-stone-500">
            {photos.length}/{MAX_PHOTOS} photos
          </p>
        </section>

        <section className="mt-6">
          <label
            htmlFor="asking-price"
            className="block text-sm font-medium text-stone-700"
          >
            Asking Price
          </label>
          <div className="mt-1.5 flex rounded-xl border border-stone-300 bg-white">
            <span className="flex items-center pl-4 text-stone-500">$</span>
            <input
              id="asking-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-r-xl border-0 py-3 pr-4 pl-1 text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </section>

        <section className="mt-6">
          <label
            htmlFor="additional-notes"
            className="block text-sm font-medium text-stone-700"
          >
            Additional Notes (Optional)
          </label>
          <textarea
            id="additional-notes"
            placeholder="Brand, dimensions, condition details"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="mt-1 text-xs text-stone-500">
            Include any info about the maker, materials, measurements, or wear.
          </p>
        </section>

        <div className="mt-8">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
          >
            {isAnalyzing ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                Analyze Item
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
          {!canAnalyze && (
            <p className="mt-2 text-center text-xs text-stone-500">
              Add at least one photo to analyze.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
