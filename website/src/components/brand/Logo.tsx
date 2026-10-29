import React from "react";

export interface LogoProps {
  tone?: "ink" | "sky" | "white";
  size?: "default" | "compact";
  ariaLabel?: string;
  decorative?: boolean;
  className?: string;
}

/**
 * يعرض الشعار الأصلي المرفق (216×188 RGBA) عبر CSS mask-image
 * لتغيير لونه إلى الأزرق الداكن (ink) أو السماوي (sky-700) أو الأبيض (white)
 * مع الحفاظ التام على شفافية ورسم الشعار الأصلي دون تشويه.
 */
export function Logo({
  tone = "ink",
  size = "default",
  ariaLabel = "شعار د. ريهام القحطاني",
  decorative = false,
  className = "",
}: LogoProps) {
  const toneClass =
    tone === "sky"
      ? "brand-logo--sky"
      : tone === "white"
      ? "brand-logo--white"
      : "";
  const sizeClass = size === "compact" ? "brand-logo--compact" : "";

  return (
    <span
      className={`brand-logo ${toneClass} ${sizeClass} ${className}`.trim()}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative ? "true" : undefined}
    >
      {/* عنصر احتياطي يظهر فقط في المتصفحات التي لا تدعم CSS mask-image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-original.png"
        alt=""
        width={216}
        height={188}
        className="brand-logo__fallback"
        aria-hidden="true"
      />
    </span>
  );
}
