import React from "react";

const BIDI_TOKEN_REGEX = /(\+\d{1,4}[\s-]?\d[\d\s-]{5,}\d|@[a-zA-Z0-9._]+)/g;

/**
 * يعزل أرقام الهواتف الدولية (مثل +966 580779630) والمعرفات اللاتينية (مثل @dr.rehamdq)
 * داخل وسم <bdi dir="ltr" className="ltr-inline"> لضمان ظهور مفتاح الدولة +966 في اليسار
 * متبوعًا بالرقم 580779630 بشكل طبيعي داخل الفقرات العربية (RTL).
 */
export function renderBidiSafeText(text: string): React.ReactNode {
  if (!text) return text;
  const parts = text.split(BIDI_TOKEN_REGEX);
  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, idx) => {
    if (!part) return null;
    if (
      (part.startsWith("+") && /\d/.test(part)) ||
      (part.startsWith("@") && part.length > 1)
    ) {
      return (
        <bdi key={idx} dir="ltr" className="ltr-inline">
          {part}
        </bdi>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}
