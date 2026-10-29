# Interaction and motion specification

## 1. Visual Motion (Refined & Perceptible)
- **Hero entrance:** Calm, poised entrance reveal of the editorial photograph and Arabic headline (`opacity` + subtle `translateY` / gentle scale settling from `1.03` to `1.0` over `700–900ms`).
- **Scroll reveal:** Gentle reveal of content blocks as the visitor scrolls (`IntersectionObserver` adding `.is-visible` once; content remains readable if JS is disabled).
- **Interactive hover/focus:** Clear, tactile feedback on buttons and links; very subtle image scale (`scale(1.025)` over `600ms cubic-bezier(0.22, 1, 0.36, 1)`) on editorial photo frames where appropriate.
- **Mobile menu:** Smooth, composed drawer transition with Escape support, focus trap, scroll lock, and return focus.
- **Restrictions:** No continuous looping animations, no mouse-tracking followers, no scroll hijacking, and no animations that delay reading. Honor `prefers-reduced-motion: reduce`.
