/**
 * أدوات تنظيف النصوص، والتحقق الصارم من الروابط، وفحص التوقيع الثنائي الفعلي للملفات (Magic Bytes).
 */

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^>]*>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
];

export function sanitizeText(input: unknown, maxLength = 10000): string {
  if (typeof input !== "string") return "";
  let cleaned = input;
  for (const regex of DANGEROUS_PATTERNS) {
    cleaned = cleaned.replace(regex, "");
  }
  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, "");
  return cleaned.trim().slice(0, maxLength);
}

export function sanitizeNullableText(
  input: unknown,
  maxLength = 10000
): string | null {
  const val = sanitizeText(input, maxLength);
  return val.length > 0 ? val : null;
}

export function sanitizeSlug(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export interface UrlValidationResult {
  valid: boolean;
  normalized: string | null;
  error?: string;
}

/**
 * يتحقق من سلامة الروابط الخارجية أو الداخلية ويمنع الروابط الميتة (#) أو البروتوكولات الخطرة.
 */
export function validateSafeUrl(
  rawUrl: unknown,
  options: {
    allowInternal?: boolean;
    allowEmpty?: boolean;
    allowMailtoTel?: boolean;
  } = {}
): UrlValidationResult {
  const {
    allowInternal = false,
    allowEmpty = true,
    allowMailtoTel = false,
  } = options;

  if (rawUrl === null || rawUrl === undefined) {
    return allowEmpty
      ? { valid: true, normalized: null }
      : { valid: false, normalized: null, error: "الرابط مطلوب." };
  }

  const trimmed = String(rawUrl).trim();
  if (!trimmed) {
    return allowEmpty
      ? { valid: true, normalized: null }
      : { valid: false, normalized: null, error: "الرابط مطلوب." };
  }

  if (trimmed === "#") {
    return {
      valid: false,
      normalized: null,
      error: "لا يُسمح باستخدام رابط فارغ (#).",
    };
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:")
  ) {
    return {
      valid: false,
      normalized: null,
      error: "بروتوكول الرابط غير آمن وغير مسموح به.",
    };
  }

  if (allowInternal && (trimmed.startsWith("/") || trimmed.startsWith("#"))) {
    if (trimmed.startsWith("//")) {
      return {
        valid: false,
        normalized: null,
        error: "الرابط النسبي غير صالح.",
      };
    }
    return { valid: true, normalized: trimmed };
  }

  if (allowMailtoTel && (lower.startsWith("mailto:") || lower.startsWith("tel:"))) {
    return { valid: true, normalized: trimmed };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") {
      return {
        valid: false,
        normalized: null,
        error: "يجب أن يبدأ الرابط الخارجي بـ https:// الآمن.",
      };
    }
    return { valid: true, normalized: parsed.toString() };
  } catch {
    return {
      valid: false,
      normalized: null,
      error: "صيغة الرابط غير صحيحة.",
    };
  }
}

export type VerifiedImageMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/avif";

export interface ImageInspectionResult {
  valid: boolean;
  mimeType?: VerifiedImageMime;
  extension?: "jpg" | "png" | "webp" | "avif";
  width?: number | null;
  height?: number | null;
  error?: string;
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * يفحص البايتات الفعلية للملف (Magic Bytes) ولا يعتمد على الامتداد أو ترويسة المتصفح،
 * ويمنع الملفات التنفيذية أو السكربتات أو ملفات SVG غير الآمنة.
 */
export function inspectUploadedImageBuffer(
  buffer: Uint8Array,
  originalFilename: string
): ImageInspectionResult {
  if (!buffer || buffer.byteLength === 0) {
    return { valid: false, error: "الملف المرفوع فارغ." };
  }

  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      error: "حجم الصورة يتجاوز الحد الأقصى المسموح به (8 ميجابايت).",
    };
  }

  const lowerName = originalFilename.toLowerCase().trim();
  const forbiddenExtensions = [
    ".exe",
    ".dll",
    ".bat",
    ".cmd",
    ".sh",
    ".ps1",
    ".php",
    ".js",
    ".mjs",
    ".ts",
    ".html",
    ".htm",
    ".svg",
    ".svgz",
    ".xml",
  ];
  if (forbiddenExtensions.some((ext) => lowerName.endsWith(ext))) {
    return {
      valid: false,
      error:
        "نوع الملف غير مسموح به أمنيًا (يُمنع رفع الملفات التنفيذية أو السكربتات أو SVG).",
    };
  }

  // Check first 512 bytes as UTF-8 text to block disguised SVG/HTML/PHP/Script payloads
  const headText = new TextDecoder("utf-8", { fatal: false })
    .decode(buffer.slice(0, 512))
    .toLowerCase();
  if (
    headText.includes("<svg") ||
    headText.includes("<script") ||
    headText.includes("<!doctype html") ||
    headText.includes("<?php") ||
    headText.startsWith("#!")
  ) {
    return {
      valid: false,
      error: "تم رفض الملف لاحتوائه على محتوى نصي أو تنفيذي غير آمن.",
    };
  }

  // Block Windows PE ('MZ') & Linux ELF ('\x7FELF')
  if (
    (buffer.byteLength >= 2 && buffer[0] === 0x4d && buffer[1] === 0x5a) ||
    (buffer.byteLength >= 4 &&
      buffer[0] === 0x7f &&
      buffer[1] === 0x45 &&
      buffer[2] === 0x4c &&
      buffer[3] === 0x46)
  ) {
    return {
      valid: false,
      error: "يُمنع رفع الملفات التنفيذية نهائيًا.",
    };
  }

  // 1. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.byteLength >= 24 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength
    );
    const width = view.getUint32(16, false);
    const height = view.getUint32(20, false);
    return {
      valid: true,
      mimeType: "image/png",
      extension: "png",
      width: width > 0 && width < 20000 ? width : null,
      height: height > 0 && height < 20000 ? height : null,
    };
  }

  // 2. JPEG: FF D8 FF
  if (
    buffer.byteLength >= 4 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return {
      valid: true,
      mimeType: "image/jpeg",
      extension: "jpg",
      width: null,
      height: null,
    };
  }

  // 3. WEBP: 'RIFF' .... 'WEBP'
  if (
    buffer.byteLength >= 16 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return {
      valid: true,
      mimeType: "image/webp",
      extension: "webp",
      width: null,
      height: null,
    };
  }

  // 4. AVIF: .... 'ftypavif' or 'ftypavis'
  if (buffer.byteLength >= 16) {
    const boxType = new TextDecoder().decode(buffer.slice(4, 12));
    if (boxType === "ftypavif" || boxType === "ftypavis") {
      return {
        valid: true,
        mimeType: "image/avif",
        extension: "avif",
        width: null,
        height: null,
      };
    }
  }

  return {
    valid: false,
    error:
      "توقيع الملف الفعلي غير مدعوم. الصيغ المسموحة هي: JPEG و PNG و WEBP و AVIF فقط.",
  };
}
