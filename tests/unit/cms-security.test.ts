import { describe, expect, it } from "vitest";
import {
  inspectUploadedImageBuffer,
  sanitizeSlug,
  sanitizeText,
  validateSafeUrl,
} from "@/lib/cms/sanitize";
import {
  hashPassword,
  signSessionToken,
  verifyPassword,
  verifySessionToken,
} from "@/lib/cms/auth";

describe("CMS Security, Sanitization, Magic-Byte Inspection & Auth", () => {
  it("strips dangerous script tags, event handlers, and unsafe URLs", () => {
    const dirty =
      'عنوان <script>alert("xss")</script> نص onclick="evil()" مع <iframe src="https://evil.com"></iframe>';
    const clean = sanitizeText(dirty);
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("onclick=");
    expect(clean).not.toContain("<iframe");
    expect(clean).toContain("عنوان");
  });

  it("validates safe URLs and rejects javascript:, data:, or bare # URLs", () => {
    expect(validateSafeUrl("/ar/book", { allowInternal: true }).valid).toBe(
      true
    );
    expect(
      validateSafeUrl("https://maps.google.com/?q=riyadh", {
        allowInternal: false,
      }).valid
    ).toBe(true);
    expect(validateSafeUrl("#", { allowInternal: true }).valid).toBe(false);
    expect(
      validateSafeUrl("javascript:alert(1)", { allowInternal: true }).valid
    ).toBe(false);
    expect(
      validateSafeUrl("data:text/html,<script>alert(1)</script>", {
        allowInternal: true,
      }).valid
    ).toBe(false);
  });

  it("normalizes slugs safely", () => {
    expect(sanitizeSlug("Hooded vs Deepset Eyes 2026!")).toBe(
      "hooded-vs-deepset-eyes-2026"
    );
  });

  it("accepts genuine PNG magic bytes and rejects executable/SVG payloads", () => {
    const validPng = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    ]);
    const resPng = inspectUploadedImageBuffer(validPng, "test.png");
    expect(resPng.valid).toBe(true);
    expect(resPng.mimeType).toBe("image/png");

    // Executable disguised as .png
    const fakeExe = new Uint8Array([
      0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00,
      0xff, 0xff,
    ]);
    const resExe = inspectUploadedImageBuffer(fakeExe, "malware.png");
    expect(resExe.valid).toBe(false);

    // SVG file rejected for XSS safety
    const svgBytes = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    );
    const resSvg = inspectUploadedImageBuffer(svgBytes, "vector.svg");
    expect(resSvg.valid).toBe(false);
  });

  it("hashes passwords with scrypt and signs/verifies session tokens", () => {
    const hash = hashPassword("StrongPass#2026");
    expect(verifyPassword("StrongPass#2026", hash)).toBe(true);
    expect(verifyPassword("WrongPass", hash)).toBe(false);

    const token = signSessionToken({
      id: "user-1",
      email: "admin@dr-reham.sa",
      name: "د. ريهام القحطاني",
      role: "admin",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
    });
    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe("admin@dr-reham.sa");
    expect(verified?.role).toBe("admin");

    // Tampered token must fail verification
    expect(verifySessionToken(`${token}tampered`)).toBeNull();
  });
});
