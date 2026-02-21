# Competitor Analysis: Lovi

**App:** Lovi (Skincare routine recommendation)
**Screen:** "Routine for you" — personalized skincare routine result

---

## Overall Impression

A calm, editorial, trust-forward product recommendation screen. It feels like a personal skincare consultation packaged into a scrollable card-based layout. The screen prioritizes **credibility** (MD-verified badges, AI picks) and **personalization** (user name, skin goal, budget range) while keeping the visual tone soft and approachable.

---

## Layout

- **Single-column vertical scroll** — the entire screen is one continuous scrollable flow. No grid, no horizontal scroll. Simple and focused.
- **Card stacking pattern** — the screen layers distinct "zones" on top of each other:
  1. Collapsed dropdown header (routine name + goal + budget)
  2. Tab bar (Morning / Evening / Weekly)
  3. Step card (product recommendation with details)
  4. Price + alternatives row
  5. Next section peek ("Your skin is our main focus")
- **Bottom sheet / modal feel** — the "Routine for you" title with the X close button suggests this is an overlay or sheet presented on top of another screen. The dimmed beige background reinforces that.
- **Progressive disclosure** — the routine dropdown is collapsed (chevron down), meaning multiple routines could be stored there. Keeps the UI clean until the user taps to expand.

---

## Color Usage

- **Background:** Warm beige/cream (#F5F0E8 range) — creates a spa-like, premium wellness tone. Not clinical white.
- **Step card background:** Slightly darker warm gray/taupe (#EDEBE6 range) — differentiates the product card from the page background without harsh contrast.
- **"Why we picked it" section:** Lighter off-white card nested inside the step card — creates a visual hierarchy within the card itself.
- **Accent yellow:** The "Step 1" pill uses a bright, warm yellow — draws the eye to progression and creates a sense of journey/order.
- **Trust green:** The "92% fit" badge uses a saturated green on a slightly lighter green background — signals compatibility/match quality.
- **Trust blue:** The "Lóvi MD Verified" badge uses a calm blue with a checkmark icon — signals medical credibility.
- **Amazon orange:** The Amazon "a" logo in the $19.00 price pill — leverages brand recognition for purchase trust.
- **Text:** Very dark brown/near-black for headings, medium gray-brown for secondary text. No pure black anywhere — everything stays warm.

---

## Typography

- **Title ("Routine for you"):** Medium weight, centered, moderate size. Not oversized — the screen doesn't need to shout.
- **Routine name ("Sunshine's Routine Formula"):** Bold/semi-bold, larger, left-aligned. Feels personal and named.
- **Supporting text (Goal, price range):** Lighter weight, smaller, gray — clearly subordinate to the routine name.
- **Tab labels (Morning, Evening, Weekly):** Small, regular weight. The active tab (Morning) appears to have a subtle outline/border treatment rather than a bold color change.
- **Step label ("Step 1"):** Inside the yellow pill — small, bold, uppercase-like treatment. Feels like a numbered badge.
- **"Cleanser":** Large, bold, serif or rounded sans-serif. This is the category label — prominent but not dominating.
- **Product name ("Secret of Sahara Cleansing Foam"):** Semi-bold, standard size. Primary product identifier.
- **Brand + price + tag ("Huxley · $19.00 · K-Beauty ✨"):** Lighter, smaller, with a sparkle emoji adding personality. The dot separators keep metadata scannable.
- **Body text ("Why we picked it" paragraph):** Regular weight, comfortable line-height (~1.5), good readability. Not too small — respects the informational nature.
- **Overall:** The type system uses 4-5 distinct sizes with clear hierarchy. Likely a rounded sans-serif or humanist typeface. Warm and friendly, not cold/geometric.

---

## Spacing & Sizing

- **Generous padding** around every element — nothing feels cramped. Likely 16-24px horizontal margins.
- **Vertical breathing room** between sections is substantial (~16-24px gaps between the dropdown, tabs, step card).
- **The step card itself** has internal padding of roughly 16-20px on all sides.
- **The "Why we picked it" inner card** has its own internal padding — creating a nested content feel.
- **Product image thumbnail** is roughly 60x80px — small but recognizable. Positioned left with text flowing to the right.
- **Badge pills** (92% fit, MD Verified) are compact with ~8px horizontal padding, rounded corners, and small text.
- **The price row** ($19.00 + "5 alternatives") uses a horizontal layout with moderate spacing between elements.

---

## Patterns & Components

- **Collapsible header dropdown:** The routine name section with the chevron suggests a select/accordion pattern — allowing users to switch between routines.
- **Segmented tab bar:** Morning / Evening / Weekly tabs with icons (sun, moon, sparkle). The active state uses a subtle outline rather than a filled background.
- **Numbered step pattern:** "Step 1" badge suggests a multi-step routine flow — gives users a sense of progress and order.
- **Product card:** A reusable card component containing image, name, brand, price, tags, trust badges, and an expandable "Why we picked it" rationale.
- **Trust badges as pills:** Small, colored pills with icons (checkmark, percentage) — compact trust signals that don't overwhelm the layout.
- **"5 alternatives" link:** Suggests a drill-down pattern where users can explore other options for each step.
- **Sticky "Buy Routine" FAB:** A floating action button at the bottom with a cart icon — always accessible, dark/prominent. This is the primary CTA for the entire screen.
- **Footer trust messaging:** "Picked by Lovi AI & Reviewed by our MDs" — a credibility footer that anchors the bottom of the experience.

---

## Interaction & UX Notes

- **Personalization is front and center** — the routine has a name ("Sunshine's"), a specific goal, and a budget range. The user immediately feels seen.
- **The "Why we picked it" section** is a standout pattern — it turns a product recommendation into a **reasoned explanation**. This builds trust and reduces "black box AI" skepticism.
- **Emoji usage is intentional** — ✨ next to "K-Beauty" adds personality without being childish. The quotation marks and badge icons add visual variety to what could be dry text.
- **The screen balances information density with scannability** — there's a lot of data (product name, brand, price, fit score, verification, rationale, alternatives) but it's layered through visual hierarchy so it doesn't feel overwhelming.
- **The muted, warm color palette** positions the product as premium wellness, not discount retail. It signals "we care about quality."
- **The peek of the next section** ("Your skin is our main focus") encourages scrolling — a classic affordance pattern.

---

## Key Takeaways

1. **Warm, muted tones** (beige, cream, taupe) establish a premium wellness brand feeling
2. **Numbered steps** create a sense of guided journey and routine progression
3. **Trust badges** (fit %, MD verified) are compact but prominent — they don't need to be large to be effective
4. **Explanatory rationale** ("Why we picked it") is a powerful trust-building pattern for AI-driven recommendations
5. **Progressive disclosure** (collapsed dropdown, peek of next section) manages complexity elegantly
6. **The sticky CTA** ensures the conversion action is always reachable regardless of scroll position
