"use client";

import React, { useEffect, useRef, useState } from "react";

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * يكشف عناصر الصفحة بهدوء أثناء التمرير مع بقاء المحتوى مقروءًا ومرئيًا بالكامل
 * في العرض الثابت وعند تعطيل JavaScript أو تفعيل تقليل الحركة.
 */
export function ScrollReveal({ children, className = "" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      return;
    }

    const rect = el.getBoundingClientRect();
    const startedBelowFold = rect.top > window.innerHeight * 0.9;

    if (!startedBelowFold) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsEntering(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${
        isEntering ? "scroll-reveal--entering" : ""
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
