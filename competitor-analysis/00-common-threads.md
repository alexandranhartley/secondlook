# Common Threads Across Competitors

**Sources:** Lovi, Calm, Bloom, Alan Mind, Adidas
**Purpose:** Patterns, principles, and design decisions that appeared across multiple (or all) competitor screenshots.

---

## 1. Single-Column Vertical Scroll as the Universal Layout

Every single app uses a **single-column vertical scroll** as its primary layout pattern. None of them use multi-column grids, split-screen layouts, or complex spatial arrangements on mobile.

| App | Layout variation |
|---|---|
| Lovi | Pure single-column with stacked cards |
| Calm | Single-column with nested horizontal carousel |
| Bloom | Single-column with bottom sheet overlay |
| Alan Mind | Single-column with stacked content zones |
| Adidas | Full-bleed image with floating overlays |

**The principle:** On mobile, vertical scrolling is the one interaction everyone already knows. These apps don't fight that — they work within it and add variety through *nested* patterns (carousels, sheets, overlays) rather than abandoning the single column.

---

## 2. Progressive Disclosure Is Everywhere

Every app hides complexity behind a first layer of simplicity. Users see a summary first and opt in to depth.

- **Lovi:** Collapsed routine dropdown, "5 alternatives" link, peek of next section below the fold
- **Calm:** "See All" links on sections, partial card peek in carousel, truncated descriptions with ellipsis
- **Bloom:** Compact progress bar cards that expand into a full bottom sheet with long-form explanation
- **Alan Mind:** Quote card dominates the viewport; data (mood chart) lives below the fold, rewarding scrollers
- **Adidas:** Small hotspot markers that expand into product cards on tap; story/carousel progress indicator hints at more looks

**The principle:** Show the minimum needed to orient and intrigue. Let the user pull more detail when they're ready. Never dump everything at once.

---

## 3. Warm, Intentional Backgrounds — Never Pure White, Never Pure Black

Not a single app uses a flat `#FFFFFF` white or `#000000` black as its background. Every background carries warmth, depth, or atmosphere.

| App | Background treatment |
|---|---|
| Lovi | Warm beige/cream (~#F5F0E8) |
| Calm | Deep blue/navy gradient |
| Bloom | Light warm gray/off-white (~#F5F3F0) |
| Alan Mind | Very light gray (~#FAFAFA) with a soft peach-to-pink gradient card |
| Adidas | Photography-driven (dark moody tones from the image itself) |

**The principle:** Background color is a brand signal, not a default. Even "white" apps (Bloom, Alan Mind) use warm off-whites that feel intentional. The background sets the emotional baseline before the user reads a single word.

---

## 4. Extreme Color Restraint — 1-2 Accent Colors Maximum

Every app operates with a remarkably small color palette. Accent colors are used surgically, not decoratively.

- **Lovi:** Yellow (step progression) + green (fit badge) + blue (verification badge). Three accents, but each has a distinct semantic meaning.
- **Calm:** No accent colors at all — it's monochrome blues and white. Hierarchy comes from opacity and saturation shifts.
- **Bloom:** One single accent (teal) against warm neutrals. That's it. Three total colors in the entire palette.
- **Alan Mind:** Soft pastel pink (quote card) + lavender (mood emojis). No saturated accents anywhere.
- **Adidas:** Zero accent colors — the UI is entirely black, white, and gray. The photography supplies all the color.

**The principle:** The fewer colors in the UI, the more each one means. Accent colors earn their place by carrying specific meaning (trust, progress, status) — they're never used "because it looks nice."

---

## 5. Text Hierarchy Through Weight and Size, Not Color

Across all five apps, typographic hierarchy is built almost entirely through **font weight** and **font size** — not through color changes. Secondary text uses lighter weight and smaller size, but stays in the same color family as the primary text.

Common pattern:
1. **Level 1 — Screen/page title:** Very large, bold (often serif)
2. **Level 2 — Section headings:** Large, bold or semi-bold (usually sans-serif)
3. **Level 3 — Card titles / primary labels:** Medium, semi-bold
4. **Level 4 — Metadata / supporting info:** Small, regular weight, lower opacity or lighter gray
5. **Level 5 — Utility labels (tabs, badges, timestamps):** Very small, regular

**The principle:** Color is precious (see #4 above), so hierarchy is handled by the typographic system instead. This keeps the palette clean and creates a consistent visual rhythm. If you need 5 levels of hierarchy, you need 5 levels of type treatment — not 5 colors.

---

## 6. Serif Headings for "Thoughtful" Screens

Three of the five apps use serif (or semi-serif) typefaces for their screen-level titles:

- **Bloom:** "Daily Insights" — large serif heading with a literary, reflective quality
- **Alan Mind:** "Insights" — bold serif that feels like a magazine section header
- **Lovi:** "Cleanser" category label appears to use a rounded serif or similar

The other two (Calm, Adidas) use sans-serif throughout — but their contexts are different (entertainment/media and athletic commerce).

**The principle:** Serif typefaces signal thoughtfulness, editorial quality, and trustworthiness — especially for screens dealing with insights, analysis, or personal data. They elevate a utility screen into something that feels curated.

---

## 7. Rounded Corners on Everything

Every app uses generously rounded corners on cards, buttons, pills, images, and containers. No sharp rectangles anywhere.

- **Calm:** ~16-20px radius — the most aggressively rounded, creating a "pillow-like" softness
- **Lovi:** ~12-16px on cards, ~full-round on pills and badges
- **Bloom:** ~12-16px on metric cards and the bottom sheet
- **Alan Mind:** ~12-16px on the quote card and mood pills
- **Adidas:** ~12px on the floating product card; full-round on hotspot markers

**The principle:** Rounded corners universally signal approachability and friendliness. Sharp corners feel technical and rigid. In wellness, self-care, and lifestyle apps especially, rounding is a low-effort way to soften the entire experience.

---

## 8. Cards That Separate Through Shade, Not Borders

All five apps use cards or containers to group content — but none of them use visible borders (strokes/outlines) to define those cards. Instead, cards differentiate from their backgrounds through:

- **Subtle shade differences** (Lovi's slightly darker taupe card on beige, Bloom's white card on off-white)
- **Elevation/shadow** (Bloom's metric cards, Alan Mind's quote card)
- **Gradient or color fill** (Alan Mind's peach-pink gradient card, Calm's slightly lighter blue cards)

**The principle:** Borders add visual noise. Shade separation is quieter and more elegant. It creates clear groupings without introducing new visual elements (lines) that compete with the content inside the card.

---

## 9. Overlays and Sheets Over Full-Page Navigation

When a user needs more detail, these apps overwhelmingly keep them in context rather than navigating to a new screen:

- **Lovi:** The entire "Routine for you" view appears to be a modal/sheet over the parent app
- **Bloom:** Tapping a metric card slides up a bottom sheet with long-form detail, keeping the parent visible behind
- **Adidas:** Tapping a hotspot reveals a floating product card overlaid on the photo — no navigation at all
- **Calm:** The "How are you feeling?" prompt likely opens a sheet or inline interaction

**The principle:** Full-page navigation breaks spatial memory — "where was I?" Overlays and sheets let users drill into detail while maintaining their sense of place. This is especially important for screens with multiple items (routines, metrics, products) where users will want to explore several in sequence.

---

## 10. Metadata Formatted as "Dot-Separated Strings"

A small but recurring pattern: multiple apps compress metadata into a single line using centered dots (·) as separators.

- **Lovi:** "Huxley · $19.00 · K-Beauty ✨"
- **Calm:** "Sleep Story · Matthew McConaughey" and "Movement · 6 min"

**The principle:** Dot separators are lighter than pipes (|), slashes (/), or commas. They keep metadata scannable and compact without adding visual weight. It's a tiny detail, but it contributes to the overall feeling of lightness and elegance.

---

## 11. Content Leads, Chrome Follows

In every screenshot, the *content* dominates the screen while the *UI framework* (navigation bars, tab bars, system indicators) is minimized or transparent:

- **Adidas:** The photo IS the screen. Navigation is nearly invisible.
- **Calm:** The gradient background flows behind everything. The tab bar is subtle.
- **Lovi:** The close (X) button and tab bar are the only "chrome" — the rest is content cards.
- **Bloom:** A close button and a drag indicator are the only non-content UI.
- **Alan Mind:** The bottom tab bar is quiet (light gray on white). The content commands 85%+ of the viewport.

**The principle:** The UI should feel like it disappears. Users came for the content (recommendations, insights, products, routines) — not for the buttons and bars. The best mobile designs make the structural chrome invisible so the content fills the experience.

---

## 12. Personalization as a First-Class Citizen

Every app communicates "this is for YOU specifically" — not generic:

- **Lovi:** Named routine ("Sunshine's"), specific skin goal, budget range, "92% fit" score
- **Calm:** "Recently Played" (your history), "Recommended for You," "How are you feeling?" (your current state)
- **Bloom:** "Your Mindset" metrics, dated to a specific day, personalized progress bars
- **Alan Mind:** "This week" mood data, personal mood history, navigable week-by-week
- **Adidas:** Editorially curated "looks" — less explicit personalization but still curated, not a generic catalog

**The principle:** Personalization isn't just a backend feature — it needs to be visually signaled. Using possessive language ("Your Mindset," "for you"), showing user-specific data, and incorporating names/dates all reinforce that the experience was built for this particular person.

---

## 13. Trust Is Earned Through Explanation, Not Just Assertion

Apps that make recommendations go beyond "here's what we suggest" to explain **why**:

- **Lovi:** "Why we picked it" section with specific ingredient rationale + "92% fit" score + "MD Verified" badge + "Picked by Lovi AI & Reviewed by our MDs" footer
- **Bloom:** Long-form text explanation of what "Growth Mindset" means and why it matters + qualitative label ("Standard") alongside the visual bar
- **Alan Mind:** Quote attribution (not anonymous), mood labels in everyday language ("Comfortable" not "Score: 7")
- **Calm:** Content metadata (duration, type, creator) — users can judge before committing

**The principle:** In an era of AI-driven recommendations, "because we said so" isn't enough. Users trust systems that show their reasoning. Explanations, attributions, qualification labels, and rationale sections all convert opaque recommendations into transparent ones.

---

## 14. Emotional Safety in Data Presentation

Apps that show personal data (mood, progress, metrics) consistently present it without judgment:

- **Alan Mind:** "No mood" for missing data — neutral gray, no warning icon, no prompt to "fix" it
- **Bloom:** "Standard" as a qualitative label — not "Average" or "Needs Improvement"
- **Alan Mind:** Emoji faces for mood — soft, friendly, non-clinical
- **Bloom:** Progress bars without aggressive targets or red/green coloring

**The principle:** Wellness and self-improvement data is emotionally sensitive. The visual treatment must avoid triggering shame, guilt, or anxiety. Neutral language, soft colors, and non-judgmental empty states are essential.

---

## 15. Generous Spacing as a Brand Signal

All five apps use notably generous spacing — padding, margins, and gaps that are larger than strictly "necessary":

- Horizontal margins consistently in the **16-24px** range
- Vertical section gaps in the **16-32px** range
- Internal card padding at **16-20px** minimum
- Line-heights for body text at **1.5-1.6** — comfortable, not cramped

**The principle:** Generous spacing doesn't just improve readability — it communicates quality and care. Cramped layouts feel cheap or overwhelming. Breathing room signals "we respect your attention" and "there's no rush." It's one of the most reliable ways to make an app feel premium without changing a single visual element.

---

## Summary Table

| Principle | Lovi | Calm | Bloom | Alan Mind | Adidas |
|---|:---:|:---:|:---:|:---:|:---:|
| Single-column vertical scroll | ✓ | ✓ | ✓ | ✓ | ✓ |
| Progressive disclosure | ✓ | ✓ | ✓ | ✓ | ✓ |
| Warm/intentional backgrounds | ✓ | ✓ | ✓ | ✓ | ✓ |
| 1-2 accent colors max | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hierarchy via weight/size not color | ✓ | ✓ | ✓ | ✓ | ✓ |
| Serif headings | ~ | — | ✓ | ✓ | — |
| Rounded corners everywhere | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cards separated by shade not borders | ✓ | ✓ | ✓ | ✓ | ✓ |
| Overlays/sheets over full navigation | ✓ | ~ | ✓ | — | ✓ |
| Dot-separated metadata | ✓ | ✓ | — | — | — |
| Content leads, chrome follows | ✓ | ✓ | ✓ | ✓ | ✓ |
| Personalization visually signaled | ✓ | ✓ | ✓ | ✓ | ~ |
| Trust through explanation | ✓ | ~ | ✓ | ✓ | ~ |
| Emotional safety in data | — | — | ✓ | ✓ | — |
| Generous spacing | ✓ | ✓ | ✓ | ✓ | ✓ |

*✓ = clearly present, ~ = partially present, — = not observed or not applicable*
