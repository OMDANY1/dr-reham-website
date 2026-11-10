"use client";

import React, { useEffect, useRef, useState } from "react";

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * يكشف عناصر الصفحة وأقسامها وبطاقاتها المتتابعة (.stagger-item) بحركة انسيابية (60fps)
 * أثناء التمرير وعند التحميل، مع احترام تفضيل تقليل الحركة (prefers-reduced-motion).
 */
export function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "pending" | "entering">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") {
      return;
    }

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setState("idle");
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setState("entering");
      return;
    }

    const rect = el.getBoundingClientRect();
    const isInitiallyVisible = rect.top <= window.innerHeight * 0.92;

    if (isInitiallyVisible) {
      setState("entering");
      return;
    }

    setState("pending");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState("entering");
            observer.disconnect();
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stateClass =
    state === "pending"
      ? "scroll-reveal--pending"
      : state === "entering"
      ? "scroll-reveal--entering"
      : "";

  return (
    <div
      ref={ref}
      style={
        delayMs > 0
          ? ({ "--reveal-delay": `${delayMs}ms` } as React.CSSProperties)
          : undefined
      }
      className={`scroll-reveal ${stateClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
