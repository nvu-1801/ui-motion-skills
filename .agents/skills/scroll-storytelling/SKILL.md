---
name: scroll-storytelling
description: Implement sticky scroll-driven storytelling and chapter reveals with CSS or GSAP ScrollTrigger.
---

# scroll-storytelling

- Define each chapter’s content and visual change. Render all copy and links in normal document order.
- Start with CSS sticky for the stage and responsive chapter heights. Check that ancestor overflow does not change the intended scrolling container.
- For a scrubbed timeline, use a single normalized progress value and clean up subscriptions on unmount. Refresh geometry when layout changes.
- Preserve native scroll. For reduced motion, keep a stable visual and retain access to all chapters. Test forward and reverse scroll, resize and mobile browser chrome.
