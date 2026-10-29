"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function PreviewBanner({ userName }: { userName?: string }) {
  const router = useRouter();

  async function exitPreview() {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_preview", enable: false }),
    });
    const url = new URL(window.location.href);
    url.searchParams.delete("preview");
    router.replace(url.pathname + url.search);
    router.refresh();
  }

  return (
    <div
      role="region"
      aria-label="شريط معاينة المسودات المحمي"
      data-testid="cms-preview-banner"
      style={{
        backgroundColor: "var(--color-navy)",
        color: "var(--color-white)",
        paddingBlock: "0.65rem",
        paddingInline: "1.25rem",
        borderBlockEnd: "2px solid var(--color-teal)",
        fontSize: "0.9rem",
        zIndex: 190,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <span
            style={{
              display: "inline-block",
              padding: "0.15rem 0.65rem",
              borderRadius: "999px",
              backgroundColor: "var(--color-teal)",
              color: "var(--color-white)",
              fontWeight: 700,
              fontSize: "0.78rem",
            }}
          >
            وضع المعاينة المحمي
          </span>
          <span>
            أنت تعاين المسودات والتعديلات غير المنشورة
            {userName ? ` (${userName})` : ""} — هذه التعديلات لا تظهر للزوار
            العامين حتى يتم نشرها.
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            href="/admin"
            style={{
              color: "var(--color-white)",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            العودة للوحة الإدارة
          </Link>
          <button
            type="button"
            onClick={exitPreview}
            style={{
              padding: "0.3rem 0.85rem",
              borderRadius: "0.45rem",
              border: "1.5px solid var(--color-white)",
              backgroundColor: "transparent",
              color: "var(--color-white)",
              fontFamily: "var(--font-ar)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            إنهاء المعاينة
          </button>
        </div>
      </div>
    </div>
  );
}
