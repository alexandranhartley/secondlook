# Motion Design Audit — SecondLook

An audit of UI animations, transitions, and motion in the codebase from a design-motion perspective (easing, duration, choreography, purpose, accessibility).

---

## Executive summary

Motion is used in three main areas: **analyzing flow** (glow pulse, scan bar, spark trail, unblur), **interactive UI** (cards, accordions, hover states, question dissolve), and **loading** (spinner). Easing and intent are generally good; **accessibility is missing** (no `prefers-reduced-motion`), one animation uses **linear** timing, and a few **durations** are long for their context. **Choreography** on the analyzing screen is busy but purposeful.

---

## What’s working well

- **Spark trail** (`globals.css`): `cubic-bezier(0.4, 0, 0.2, 1)` and 1.5s duration fit a single “reveal” moment.
- **Unblur** (`globals.css`): 1s `ease-out` is appropriate for a content reveal.
- **Question fade-out** (`GlobalQuestionsSection.tsx`): `ease-out` is correct for an exit.
- **Chevron rotation** (`SavingsCard`, `InsightRow`): `transition-transform` is scoped well; Tailwind default duration is in a good range.
- **Hover states** (`EntryScreen`, `PhotoUploadZone`): `transition-shadow` / `transition-colors` are appropriate and low-risk.
- **Loading** (`DetailsScreen`): `animate-spin` is a clear, conventional loading cue.
- **Pulse intent** (`AnalyzingScreen`): requestAnimationFrame “breathing” glow supports the “analyzing” state.

---

## Issues and recommendations

### 1. Accessibility — `prefers-reduced-motion` (critical)

**Finding:** There is no handling of `prefers-reduced-motion` anywhere. Users who prefer reduced motion will still see all animations.

**Impact:** Can affect comfort and safety for people with vestibular or motion sensitivity.

**Recommendation:** Add a global reduced-motion rule and, where needed, shorten or disable animations.

**Example** in `globals.css` (after existing `@keyframes`):

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**In `AnalyzingScreen.tsx`:** Gate the `requestAnimationFrame` glow pulse and the edge overlay opacity transitions on reduced-motion preference (e.g. `window.matchMedia('(prefers-reduced-motion: reduce)')`), or rely on the global rule above to squash CSS animation/transition duration.

---

### 2. Easing — linear on scan bar

**Finding:** `globals.css` line 129:

```css
.scan-bar-container {
  animation: scan-bar 2s linear infinite;
}
```

**Issue:** Linear timing feels mechanical. For a continuous “scanning” effect, a slight ease can make it feel more natural even if the loop is infinite.

**Recommendation:** Use a light ease, e.g. `ease-in-out` or `cubic-bezier(0.45, 0, 0.55, 1)`. If the bar must move at constant speed for a “tech” look, keep linear but ensure reduced-motion users don’t see it (see above).

---

### 3. Duration — long transitions

| Location | Current | Note |
|----------|--------|------|
| `AnalyzingScreen.tsx` ~250–252 | Box-shadow `1s` | 1s is long for a state change; 300–500 ms usually feels snappier. |
| `GlobalQuestionsSection.tsx` ~128 | 600 ms fade-out | Exit is a bit slow; 300–400 ms is often enough. |

**Recommendation:**

- Border glow transition: try `0.4s` or `0.5s` instead of `1s`.
- Question dissolve: try `400ms` (and keep `ease-out`).

---

### 4. Choreography — analyzing screen

**Finding:** Analyzing screen combines: pulsing glow (requestAnimationFrame), scan bar (CSS), edge overlays (opacity transitions), then spark + unblur. Multiple things move at once.

**Assessment:** The hierarchy is clear (scan bar + text = primary; glow = atmosphere; spark + unblur = payoff). So choreography is acceptable, but it’s the heaviest part of the app.

**Recommendation:** Keep as-is from a design perspective. When you add `prefers-reduced-motion`, consider turning off or greatly simplifying the scan bar and pulse first, and keep the final “reveal” (unblur + spark) short and minimal for reduced-motion users.

---

### 5. Scope — `transition-all`

**Finding:** `transition-all` is used in:

- `SavingsCard.tsx` line 43 (card container)
- `InsightRow.tsx` line 44 (card container)
- `results/page.tsx` line 166 (thumbnail button)

**Issue:** `transition-all` animates every transitionable property. It can cause unintended animations (e.g. layout or color) and makes it harder to reason about performance.

**Recommendation:** Replace with explicit properties, e.g. `transition-shadow` or `transition-[box-shadow,transform]` for the cards, and for the thumbnail `transition-colors` and `transition-shadow` (or only the properties that actually change).

---

### 6. Edge overlay opacity — 0.1s

**Finding:** `AnalyzingScreen.tsx` lines 271, 286, 301, 316: `transition: 'opacity 0.1s ease-out'` on the edge overlays.

**Assessment:** 100 ms is very fast and used to follow the JS-driven glow intensity. Purpose is clear; no change needed unless you want the edges to feel slightly softer (e.g. 150 ms).

---

## Quick reference — suggested defaults

| Context | Current | Suggested |
|--------|--------|-----------|
| Border glow transition | 1s | 0.4s–0.5s |
| Question exit | 600 ms | 400 ms |
| Scan bar easing | linear | ease-in-out (or keep linear + reduce for reduced-motion) |
| Card / thumbnail | transition-all | transition-shadow, transition-transform, or transition-colors as needed |
| Reduced motion | not implemented | Implement global + analyzing-screen checks |

---

## File checklist

- [x] **globals.css** — Add `@media (prefers-reduced-motion: reduce)`; scan-bar easing set to `ease-in-out`.
- [x] **AnalyzingScreen.tsx** — Box-shadow transition shortened to 0.45s.
- [x] **GlobalQuestionsSection.tsx** — Dissolve shortened to 400 ms.
- [x] **SavingsCard.tsx** — `transition-all` → `transition-shadow`.
- [x] **InsightRow.tsx** — `transition-all` → `transition-shadow`.
- [x] **results/page.tsx** — `transition-all` → `transition-colors transition-shadow` on thumbnail.

---

*Audit completed with a focus on purpose, easing, duration, choreography, and accessibility.*
