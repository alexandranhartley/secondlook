# Competitor Analysis: Bloom

**App:** Bloom (Mental health & self-improvement)
**Screen:** "Daily Insights" — mindset assessment with bottom sheet detail view

---

## Overall Impression

A clean, clinical-yet-warm insights screen that uses a **bottom sheet** pattern to provide drill-down detail. The design communicates "measured wellness" — it's data-driven but presented in a way that feels approachable rather than intimidating. There's a deliberate tension between the soft visual treatment and the structured, metric-oriented content. The screen is all about **progress visualization** and **self-understanding**.

---

## Layout

- **Two-layer layout** — the screen shows both a parent view AND a bottom sheet overlay simultaneously:
  - **Parent (behind):** The full "Daily Insights" screen with a date, section title, and progress bars in cards.
  - **Bottom sheet (front):** A draggable sheet that overlays the lower 60% of the screen, showing detail for a selected insight.
- **The parent screen** uses a single-column vertical list of metric cards ("Growth Mindset", "Balance"), each containing a labeled progress bar.
- **The bottom sheet** contains:
  1. A drag indicator pill at the top (centered gray bar)
  2. A mini-card repeating the selected metric's progress bar (for context)
  3. A large bold title
  4. A long-form text description that scrolls
- **The close (X) button** is positioned at the top-right of the parent screen — standard dismissal pattern.

---

## Color Usage

- **Background:** Very light warm gray / off-white (#F5F3F0 range) — subtle warmth, not sterile. Positioned between clinical and cozy.
- **The dimmed overlay** between the parent and bottom sheet is a soft, semi-transparent gray — standard sheet scrim that indicates the sheet is a layer above.
- **Cards:** White or near-white with no visible border — they separate from the background through a slight elevation/shadow or subtle shade difference.
- **Progress bar (primary fill):** Deep teal/dark cyan (#1A7A7A range) — a distinctive, sophisticated accent color. Not a standard blue or green — it feels intentional and branded.
- **Progress bar (track):** Light gray (#E0E0E0 range) — minimal, letting the fill color do the work.
- **Text:** Dark brown-black for headings, medium gray for supporting text (date, "Standard" label). No pure black — everything has a warm undertone.
- **"Standard" label:** Positioned right-aligned at the end of the progress bar in a muted gray-brown — it's a qualitative label for the quantitative bar.
- **Overall:** The palette is extremely restrained — essentially 3 colors: warm off-white background, teal accent, and dark text. This restraint signals sophistication and clarity.

---

## Typography

- **"Daily Insights" (parent title):** Very large, bold, serif or rounded serif typeface. This is the most prominent text on screen — it sets a literary, thoughtful tone.
- **Date ("6 Mar 2024"):** Small, regular weight, muted gray. Positioned directly below the title — a temporal anchor.
- **Section header ("Your Mindset"):** Medium size, bold, dark. A structural label that groups the metric cards below.
- **Metric name in card ("Growth Mindset", "Balance"):** Semi-bold, medium size, dark. The primary label within each card.
- **"Standard" (level label):** Small, regular, muted — right-aligned. A qualitative rating that supplements the visual bar.
- **Bottom sheet title ("Growth Mindset"):** Very large, very bold, dark. Repeated from the card but now as the hero heading for the detail view.
- **Bottom sheet body text:** Regular weight, medium size, comfortable line-height (~1.6). This is a long-form reading experience — the type is sized for legibility and comfort, not compactness.
- **Overall typeface:** The headings appear to use a serif or semi-serif typeface (the "Daily Insights" especially has a literary feel). Body text may use a clean sans-serif. The contrast between serif headings and sans body creates a sophisticated editorial feel.

---

## Spacing & Sizing

- **Horizontal margins:** Roughly 20-24px — generous and consistent.
- **Vertical spacing between sections:** ~20-24px between the date and "Your Mindset" header, and between the header and first card.
- **Metric cards:** Full-width (minus margins), roughly 80-90px tall. Internal padding of ~16px.
- **Progress bars:** Full width within the card, roughly 8-10px tall with rounded ends. The fill amount represents the metric visually.
- **Gap between stacked cards:** ~12-16px.
- **Bottom sheet:** Covers roughly 55-60% of the screen from the bottom. Has ~24px horizontal padding and ~20px top padding.
- **Drag indicator pill:** Centered, roughly 40px wide and 4px tall, with rounded ends — standard iOS/Android sheet affordance.
- **The mini metric card** inside the bottom sheet has the same styling as the parent cards — creates visual continuity between the two layers.
- **Body text paragraph:** Comfortable margins with ~16px paragraph spacing.

---

## Patterns & Components

- **Bottom sheet with detail view:** The primary interaction pattern — tapping a metric card slides up a sheet with expanded explanation. The parent content dims and shifts back. This is a standard iOS-style modal sheet.
- **Drag indicator:** The small pill at the top of the sheet signals that the user can drag to resize or dismiss the sheet.
- **Progress bar cards:** Reusable components — each card contains a label, a horizontal progress bar, and a qualitative level (e.g., "Standard"). The same component appears in both the parent list and the sheet.
- **Close button (X):** Top-right corner of the parent screen, likely dismisses the entire "Daily Insights" view (not the sheet).
- **Date anchoring:** Positioning the date directly below the page title provides temporal context — "these insights are from this specific date."
- **Metric → detail drill-down:** The flow from a compact card to an expanded explanation follows a progressive disclosure pattern — summary first, detail on demand.

---

## Interaction & UX Notes

- **The bottom sheet creates a "focus" moment** — instead of navigating to a new screen, the detail appears in context. The user can see both the overview (dimmed behind) and the detail (sheet in front) simultaneously. This maintains spatial orientation.
- **The repeated progress bar** in the bottom sheet header is a smart touch — it carries context from the parent into the detail. The user doesn't have to remember "what did that bar look like?" because it's right there.
- **The qualitative label ("Standard")** next to the progress bar is important — without it, the bar is ambiguous. "Standard" tells the user where they fall on a scale in words, not just visually.
- **The long-form text** in the bottom sheet suggests Bloom invests in explanatory content. This isn't a quick glance screen — it's a learning moment. The typography and spacing are optimized for reading.
- **The dimming of the parent** when the sheet is open creates a clear visual hierarchy — "focus here now."
- **The screen shows a snapshot in time** (dated), suggesting these insights change daily — creating a reason to return.

---

## Key Takeaways

1. **Bottom sheet for drill-down detail** preserves context while revealing more information — avoids full-page navigation for supplementary content
2. **Teal/dark cyan** as a single accent color with a warm neutral palette creates a distinctive, branded look with minimal color usage
3. **Progress bars with qualitative labels** ("Standard") make abstract metrics more meaningful and human-readable
4. **Serif headings** add a literary, thoughtful quality — appropriate for self-reflection/insight content
5. **Repeating the context card** inside the detail view (the mini progress bar in the sheet) is an excellent continuity pattern
6. **Extreme color restraint** (3 colors total) signals confidence and maturity — the design doesn't need to be colorful to be effective
7. **Long-form text content** is given proper typographic treatment — large size, generous line-height, comfortable margins — not crammed
