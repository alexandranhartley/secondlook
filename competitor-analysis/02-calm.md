# Competitor Analysis: Calm

**App:** Calm (Meditation & sleep wellness)
**Screen:** Home feed — "Recently Played" and "Recommended for You" sections

---

## Overall Impression

A rich, immersive, content-forward home screen that uses deep color saturation and media-heavy cards to create an emotional, inviting atmosphere. The design language says "relax into this" — everything from the gradient backgrounds to the rounded shapes signals calm and comfort. The screen prioritizes **content discovery** and **re-engagement** (recently played, personalized recommendations).

---

## Layout

- **Single-column vertical scroll** with horizontally scrolling card rows nested inside.
- **Section-based architecture** — the screen is divided into clearly labeled sections:
  1. "Recently Played" — horizontal card carousel (2 visible, likely more off-screen)
  2. "Personalize Your Recommendations" — single interactive prompt row
  3. "Recommended for You" — vertical list of content cards
- **Tab bar navigation** fixed at the bottom — Home, Sleep, Discover, Profile. Four items, evenly spaced.
- **The horizontal carousel** shows 2 cards at roughly 48-50% width each, with the second card slightly cropped at the right edge — a classic "peek" affordance that signals horizontal scrollability.
- **Content cards in the "Recommended" section** use a horizontal layout (image left, text right) — a standard media list pattern.

---

## Color Usage

- **Dominant deep blue/navy gradient** — the entire screen background uses a rich dark blue gradient that shifts from a slightly lighter blue at the top to deeper navy at the bottom. This creates depth and a "nighttime" or "calm" atmosphere.
- **Card backgrounds** use slightly lighter or more saturated blues — they lift off the gradient background subtly rather than using white cards.
- **The "How are you feeling?" row** uses a darker, more solid blue background — differentiating it as an interactive element rather than content.
- **Purple/lavender accents** — the bottom tab bar area transitions into a purple-blue tone, and the "Recommended" card images have warm/cool contrast.
- **White text throughout** — all text is white or near-white, creating high contrast against the dark backgrounds. This is a fully "dark mode" / dark-themed experience.
- **The "See All" link** is white, matching the section title — it's differentiated by size and weight rather than color.
- **Active tab indicator** — the Home tab uses a filled white icon with a subtle background highlight, distinguishing it from the other outlined icons.
- **Emoji accent** — the "How are you feeling?" prompt uses a yellow smiley emoji (🫠 or similar) as a visual hook — adds warmth and humanity to an otherwise cool-toned screen.

---

## Typography

- **Section headings ("Recently Played", "Personalize Your Recommendations", "Recommended for You"):** Bold, large, white. These are the primary structural markers — they're big enough to scan while scrolling quickly.
- **"See All" link:** Smaller, regular weight, right-aligned against the heading. Clear secondary action.
- **Card titles ("Take a moment to reflect", "Wonder"):** Semi-bold, medium size, white. Positioned below or overlaid on the card images.
- **Card metadata ("Sleep Story · Matthew McConaughey", "▶ 29 min"):** Smaller, lighter weight, slightly lower opacity white — clearly subordinate.
- **Content list metadata ("Movement · 6 min", "Song"):** Small, regular, lighter opacity — category + duration as a scannable label.
- **Content list titles ("Daily Move", "Infinite Ambient for Relaxation"):** Bold, medium, white — the primary identifier in each list row.
- **Content list descriptions:** Regular weight, smaller, truncated with ellipsis ("This is Calm's Generative Music – music that has been designed and created by r...") — shows a preview without overwhelming.
- **Tab labels ("Home", "Sleep", "Discover", "Profile"):** Very small, regular weight, below icons. The active tab label appears slightly brighter/bolder.
- **Overall typeface:** Clean sans-serif, likely a system font or custom sans. Rounded feel that matches the brand personality.

---

## Spacing & Sizing

- **Horizontal margins:** Roughly 16-20px on left and right sides of the screen.
- **Section gap:** ~24-32px between sections — generous breathing room.
- **Card carousel gap:** ~12-16px between cards within the horizontal scroll.
- **Card height in carousel:** Roughly 180-200px — large enough for imagery to be immersive.
- **Card corner radius:** Very rounded — approximately 16-20px. Everything feels soft and pillow-like.
- **The "How are you feeling?" row:** Full-width (minus margins), ~56-64px tall, with generous internal padding. The chevron (>) on the right indicates it's tappable.
- **Content list rows:** ~80-90px tall with ~12-16px gaps between them. Image thumbnails are roughly 80x80px with rounded corners.
- **Bottom tab bar:** ~80-84px tall including safe area. Icons are roughly 24px with labels below.
- **Play button overlays** on content thumbnails are small (roughly 20-24px circles) — present but not dominant.

---

## Patterns & Components

- **Horizontal card carousel:** Classic mobile pattern for browseable content. Shows partial next card as a scroll affordance.
- **Media cards with image backgrounds:** The "Recently Played" cards use full-bleed imagery or illustrated backgrounds — the content itself IS the visual. No separate text-only areas.
- **Duration badge overlay ("▶ 29 min"):** A small overlay on the card image — provides utilitarian info (how long will this take?) without a separate row.
- **Interactive prompt row ("How are you feeling?"):** A single-tap entry point that likely opens a mood check-in or quiz. The emoji + chevron combo signals it's conversational and leads somewhere.
- **Content list with thumbnails:** Standard horizontal media list — image left, stacked text right. Used for the "Recommended" section where more detail per item is needed.
- **Category tags as metadata:** "Movement · 6 min" and "Song" — small labels above the title that help users quickly scan content type.
- **Bottom tab bar:** Standard iOS tab bar pattern with 4 items. Clean, icon + label, with an active state indicator.
- **"See All" action:** Positioned right-aligned next to section headers — a standard pattern for expanding a section into a full list view.

---

## Interaction & UX Notes

- **The dark, immersive color scheme** is deeply intentional — Calm is a sleep and meditation app, so the visual design mirrors the feeling of winding down. The deep blues feel like twilight.
- **"Recently Played" at the top** prioritizes re-engagement — getting users back to familiar content quickly reduces friction.
- **"Personalize Your Recommendations"** placed in the middle is smart — it's a soft prompt to improve personalization data. The conversational tone ("How are you feeling?") makes it feel like care, not data collection.
- **Content diversity** in the Recommended section (Movement, Song) shows the app has range — it's not just meditation. The different content types are distinguished by their category tags.
- **The overall screen density is moderate** — it shows enough content to invite exploration without overwhelming. 3-4 distinct content items are visible at any time.
- **No aggressive CTAs or marketing** — the screen feels like a content library, not a sales funnel. The "Buy" or "Subscribe" messaging is absent from this view.
- **The gradient background** eliminates any visible "boundary" between sections — content flows as one continuous, ambient experience.

---

## Key Takeaways

1. **Deep, saturated color gradients** can create emotional atmosphere without any imagery — the blue gradient alone says "calm"
2. **Horizontal carousels with peek affordance** are effective for re-engagement content (recently played, favorites)
3. **Mixing card styles** (large visual cards vs. compact list rows) within the same screen adds visual variety and serves different content needs
4. **The mood check-in prompt** is a clever pattern — it simultaneously personalizes the experience and makes the user feel cared for
5. **White-on-dark typography** at multiple opacity levels creates hierarchy without needing multiple colors
6. **Very rounded corners** (16-20px) contribute significantly to the "soft and calming" brand personality
7. **Minimal use of borders or dividers** — sections are separated by spacing and background color shifts, not hard lines
