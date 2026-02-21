"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fileToDataUrl,
  getStoredPhotos,
  MAX_PHOTOS,
  setStoredPhotos,
  setStoredPrice,
  setStoredNotes,
  clearStoredAnalysis,
} from "../lib/capture";

export default function DetailsScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
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

  const handleAnalyze = useCallback(() => {
    if (photos.length === 0) return;

    // Persist price and notes so the analyzing screen can call the API
    setStoredPrice(price);
    setStoredNotes(notes);
    // Clear any previous analysis so we always run the API with this item's photos/price
    clearStoredAnalysis();

    // Go to analyzing screen immediately; API runs there so waiting feels like progress
    router.push("/analyzing");
  }, [router, photos, price, notes]);

  const hasValidPrice =
    price.trim() !== "" &&
    !Number.isNaN(parseFloat(price)) &&
    parseFloat(price) >= 0;
  const canAnalyze = photos.length >= 1 && hasValidPrice;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white text-stone-900">
      {/* Top bar: back arrow + return to home */}
      <header className="flex shrink-0 items-center px-5 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900"
          aria-label="Return to home"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Return to home</span>
        </Link>
      </header>
      <main className="flex-1 px-5 pb-10 pt-8">
        <h1 className="font-title-serif text-2xl font-bold text-stone-900">
          Tell Us More
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Add details to help our AI advisor give you the best guidance.
        </p>

        <section className="mt-8" aria-labelledby="photos-heading">
          <h2 id="photos-heading" className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
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
          <div className="mt-2 flex gap-3">
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

        <section className="mt-8">
          <label
            htmlFor="asking-price"
            className="block text-xs font-medium uppercase tracking-[0.12em] text-stone-500"
          >
            Asking price <span className="text-stone-500">(required)</span>
          </label>
          <div className="mt-1.5 flex rounded-xl border border-stone-300 bg-white focus-within:outline focus-within:outline-2 focus-within:outline-black focus-within:outline-offset-0">
            <span className="flex items-center pl-4 text-stone-500">$</span>
            <input
              id="asking-price"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={price}
              onChange={(e) => {
                const raw = e.target.value;
                // Allow empty, digits, and one decimal with up to 2 decimal places
                if (raw === "" || /^\d*\.?\d{0,2}$/.test(raw)) {
                  setPrice(raw);
                }
              }}
              required
              aria-required="true"
              className="w-full rounded-r-xl border-0 py-3 pr-4 pl-1 text-stone-900 placeholder:text-stone-400 focus:outline-none"
            />
          </div>
        </section>

        <section className="mt-8">
          <label
            htmlFor="additional-notes"
            className="block text-xs font-medium uppercase tracking-[0.12em] text-stone-500"
          >
            Additional notes (optional)
          </label>
          <textarea
            id="additional-notes"
            placeholder="Brand, dimensions, condition details"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500"
          />
          <p className="mt-1 text-xs text-stone-500">
            Include any info about the maker, materials, measurements, or wear.
          </p>
        </section>

        <div className="mt-8">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-800 py-3 text-sm font-semibold text-white shadow-sm hover:bg-stone-900 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
          >
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
          </button>
          {!canAnalyze && (
            <p className="mt-2 text-center text-xs text-stone-500">
              {photos.length < 1
                ? "Add at least one photo to analyze."
                : "Enter an asking price to analyze."}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
