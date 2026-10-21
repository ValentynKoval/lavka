/**
 * "Fly to cart": clones the product photo and animates it into the header cart icon
 * with the Web Animations API. Purely decorative — skipped when either element is
 * missing or the visitor prefers reduced motion.
 */
export function flyToCart(): void {
  if (typeof document === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const source = document.querySelector<HTMLImageElement>("[data-product-image] img");
  const target = document.querySelector<HTMLElement>("[data-cart-icon]");
  if (!source || !target) return;
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (from.width === 0 || to.width === 0) return;

  const size = Math.min(140, from.width);
  const ghost = source.cloneNode(true) as HTMLImageElement;
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "cover",
    borderRadius: "1rem",
    zIndex: "80",
    pointerEvents: "none",
    boxShadow: "0 12px 40px -10px rgb(43 38 34 / 0.45)",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const animation = ghost.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1, offset: 0 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(0.6)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0.4, offset: 1 },
    ],
    { duration: 750, easing: "cubic-bezier(0.22, 0.8, 0.3, 1)", fill: "forwards" },
  );
  animation.onfinish = () => {
    ghost.remove();
    target.classList.remove("animate-bump");
    void target.offsetWidth; // restart the animation
    target.classList.add("animate-bump");
  };
}
