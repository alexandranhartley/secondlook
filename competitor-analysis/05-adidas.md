# Competitor Analysis: Adidas

**App:** Adidas (Athletic footwear & apparel shopping)
**Screen:** Shoppable editorial / lookbook — interactive product tagging on lifestyle imagery

---

## Overall Impression

A bold, editorial, immersive shopping experience that puts **lifestyle photography front and center** and layers shoppable product information on top. The screen feels more like a fashion magazine editorial than a traditional product listing. The design prioritizes **aspiration and inspiration** — you see the product in context (on a real person, in motion) before you see the catalog details. This is **content-led commerce** at its most confident.

---

## Layout

- **Full-bleed hero image** — the lifestyle photo takes up 100% of the screen width and approximately 85-90% of the height. There are no margins, cards, or containers for the image. It is THE layout.
- **Product hotspot markers** — small circular icons (⊕ style) are positioned directly on the image at specific points where products are visible (shirt, shorts, shoes). These are interactive tap targets.
- **Floating product card** — a white product card is overlaid on the image, anchored near the center-lower area. It contains a product photo, price, name, and category. This appears to be the "active" hotspot — the user tapped one of the markers and this card appeared.
- **Minimal top navigation** — a back arrow (←) at top-left and a progress indicator (dashed segments) at the top center. This suggests the user is swiping through a series of editorial looks/stories.
- **Bottom tab bar** — 5 icons at the very bottom: a flame/trending icon, a list/search icon, a heart/favorites icon, a bag/cart icon, and a target/discover icon. These sit on a white bar.
- **The overall structure:** Full-screen media → interactive overlays → minimal persistent chrome (top nav + bottom tabs).

---

## Color Usage

- **The photograph IS the color palette** — the screen's visual identity is entirely driven by the lifestyle photo:
  - Cool greens (lime green shorts and light sage shoes)
  - Warm neutrals (cream/off-white sweatshirt)
  - Dark moody tones (the studio/gym background with dramatic lighting)
- **Product card:** White background with black text — maximum contrast against the dark image. Clean and legible.
- **Hotspot markers (⊕):** Dark gray/charcoal circles with a white "+" symbol — visible against both light and dark areas of the photo. They have a subtle border or shadow to ensure visibility.
- **Price tag:** A very light gray pill/badge around "$89.00" — barely styled, letting the number speak.
- **Product category ("Women's Performance"):** Muted gray text — subordinate to the product name.
- **Top progress indicator:** Dashed segments in white — visible against the dark image background.
- **Back arrow:** Dark/black — visible against the lighter area at the top of the image.
- **Bottom tab bar:** White background, dark gray icons. No color accent on the active tab — very restrained.
- **Overall color strategy:** Let the photography dominate. The UI chrome is almost entirely black, white, and gray — it gets out of the way of the visual content.

---

## Typography

- **Product name ("POWER HIDDEN RACERBACK OVERLAY COVER UP"):** All-caps, bold, dark. The uppercase treatment matches Adidas's brand voice — bold, athletic, commanding. It's relatively compact for such a long name.
- **Product category ("Women's Performance"):** Regular weight, small, muted gray. A soft label below the name.
- **Price ("$89.00"):** Medium size, regular weight, dark text on a light pill. Not oversized — the price is information, not the hero.
- **No other visible text** on the main screen besides the product card and navigation elements. The photography and product details do all the talking.
- **Overall typeface:** A clean, geometric sans-serif — likely Adidas's brand font or a close relative. It's athletic, modern, and utilitarian. The all-caps product name is especially on-brand.

---

## Spacing & Sizing

- **Full-bleed image:** 0px margin on all sides. The image extends edge-to-edge and behind the status bar.
- **Top navigation:** ~16px from the top edge (below status bar). The back arrow is ~24px, and the progress segments are centered.
- **Hotspot markers:** ~32-36px diameter circles. Positioned precisely on product items in the photo. They have intentional placement relative to what they reference (collar of sweatshirt, waistband of shorts, tongue of shoe).
- **Product card:** Roughly 200px wide × 260px tall. Positioned offset from center — not perfectly centered, which gives it a more editorial, "placed" feeling rather than a rigid UI feel.
- **Card internal spacing:** ~12px padding. Product image takes up the top ~60% of the card. Text is compactly stacked below.
- **Product image in card:** A clean studio shot on white background — contrasts with the lifestyle image behind it. Roughly 160x160px.
- **Bottom tab bar:** ~60-70px tall (smaller than some apps). Icons are ~24px, evenly spaced across 5 items. No labels visible — icon-only design.
- **Gap between card text elements:** Very tight — ~4-6px between price, name, and category. Dense but readable.

---

## Patterns & Components

- **Shoppable hotspots on photography:** The defining pattern of this screen. Circular markers on an image that, when tapped, reveal product details. This is a common pattern in fashion/editorial commerce apps — it bridges lifestyle content with shopping functionality.
- **Story/carousel progress indicator:** The dashed segments at the top suggest this is one "look" in a series. Users likely swipe left/right (or it auto-advances) to see different outfits or editorial moments. Similar to Instagram Stories or TikTok-style progression.
- **Floating product card:** An overlay card that appears when a hotspot is tapped. It shows a studio product shot, price, name, and category — just enough info to decide whether to tap through to the PDP (product detail page).
- **Full-bleed imagery:** The photo isn't "in" a card — the photo IS the screen. This creates maximum visual impact and emotional engagement.
- **Icon-only bottom tab bar:** No text labels, just icons. This is a more minimal approach than most apps — it prioritizes screen real estate for content. The icons must be self-explanatory.
- **Back arrow navigation:** Top-left, suggesting this screen was navigated to from somewhere else (home feed, browse, etc.).
- **Multiple hotspots per image:** At least 3-4 markers are visible — the entire outfit is tagged. Users can explore different products from the same look.

---

## Interaction & UX Notes

- **The editorial approach to commerce** is the most distinctive element — this isn't a grid of products. It's a styled photoshoot with products embedded in it. This approach targets emotion and aspiration first, then conversion.
- **Hotspot markers create curiosity** — the small (⊕) circles invite exploration. "What is she wearing? Let me tap to find out." It turns shopping into discovery rather than a search task.
- **The floating card maintains context** — when the user taps a hotspot, the card appears but the photo remains visible. The user doesn't lose the lifestyle context while getting product details.
- **The story/carousel progression** at the top gamifies browsing — "there's more to see." This creates forward momentum and encourages full engagement with the editorial content.
- **The product image in the card** is a different shot (clean studio, white background) from the lifestyle image — this is smart. It shows the product in context AND in isolation, covering both emotional and rational shopping needs.
- **The icon-only tab bar** is a trade-off: it maximizes content area but may confuse new users. It assumes the audience is familiar with e-commerce app conventions.
- **The overall interaction model** is more like browsing a magazine than using a catalog — touch-based exploration, visual-first, minimal text, emotional engagement.

---

## Key Takeaways

1. **Full-bleed photography** creates maximum visual impact and emotional engagement — let the content be the UI
2. **Shoppable hotspots** turn editorial imagery into interactive commerce without breaking the editorial feel
3. **Story/carousel progression** indicators encourage exploration and create a sense of "there's more to discover"
4. **Floating product cards** keep context (the photo) while adding information (product details) — no full-page navigation needed
5. **Studio shot inside the card** vs. lifestyle shot in the background provides both emotional and rational product views
6. **Monochromatic UI chrome** (black, white, gray) lets photography dominate — the UI disappears in service of the content
7. **All-caps bold product names** align with athletic brand voice — typography carries brand personality even in small UI elements
8. **Icon-only tab bars** maximize content area but require very clear, distinct iconography to work
