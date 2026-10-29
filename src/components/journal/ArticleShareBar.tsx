"use client";

import React, { useState } from "react";
import { journalPageCopy } from "@/content/ar/articles";

export interface ArticleShareBarProps {
  title: string;
  excerpt?: string | null;
}

export function ArticleShareBar({ title, excerpt }: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);

  const copyCurrentUrl = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("textarea");
        input.value = url;
        input.setAttribute("readonly", "true");
        input.style.position = "absolute";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2600);
    } catch {
      // ignore clipboard errors gracefully
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: excerpt ?? title,
          url,
        });
        return;
      } catch {
        // إذا ألغى المستخدم نافذة المشاركة أو لم تكن مدعومة ننسخ الرابط كبديل
      }
    }
    await copyCurrentUrl();
  };

  return (
    <div
      className="article-share-bar"
      aria-label={journalPageCopy.articleLabels.shareHeading}
    >
      <span className="article-share-bar__label">
        {journalPageCopy.articleLabels.shareHeading}:
      </span>
      <div className="article-share-bar__actions">
        <button
          type="button"
          className="article-share-btn"
          onClick={handleShare}
          data-testid="share-article-button"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M11.5 5.5C12.6046 5.5 13.5 4.60457 13.5 3.5C13.5 2.39543 12.6046 1.5 11.5 1.5C10.3954 1.5 9.5 2.39543 9.5 3.5C9.5 4.60457 10.3954 5.5 11.5 5.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M4.5 10C5.60457 10 6.5 9.10457 6.5 8C6.5 6.89543 5.60457 6 4.5 6C3.39543 6 2.5 6.89543 2.5 8C2.5 9.10457 3.39543 10 4.5 10Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M11.5 14.5C12.6046 14.5 13.5 13.6046 13.5 12.5C13.5 11.3954 12.6046 10.5 11.5 10.5C10.3954 10.5 9.5 11.3954 9.5 12.5C9.5 13.6046 10.3954 14.5 11.5 14.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M6.25 7L9.75 4.5M6.25 9L9.75 11.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span>{journalPageCopy.articleLabels.shareButton}</span>
        </button>

        <button
          type="button"
          className={`article-share-btn ${
            copied ? "article-share-btn--copied" : ""
          }`.trim()}
          onClick={copyCurrentUrl}
          data-testid="copy-link-button"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="5.5"
              y="5.5"
              width="8"
              height="8"
              rx="1.75"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M3.5 10.5H3C2.17157 10.5 1.5 9.82843 1.5 9V3C1.5 2.17157 2.17157 1.5 3 1.5H9C9.82843 1.5 10.5 2.17157 10.5 3V3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span role="status" aria-live="polite">
            {copied
              ? journalPageCopy.articleLabels.copiedFeedback
              : journalPageCopy.articleLabels.copyLinkButton}
          </span>
        </button>
      </div>
    </div>
  );
}
