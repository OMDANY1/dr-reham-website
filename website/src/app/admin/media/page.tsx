/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import type { CmsMediaItem } from "@/lib/cms/types";

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<CmsMediaItem[]>([]);
  const [selected, setSelected] = useState<CmsMediaItem | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);

  const [replaceTargetId, setReplaceTargetId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const focalStageRef = useRef<HTMLDivElement | null>(null);

  const loadMedia = async () => {
    const mediaRes = await fetch("/api/admin/media", { cache: "no-store" });
    const data = await mediaRes.json();
    if (data.media) {
      setMediaList(data.media);
      if (selected) {
        const refreshed = data.media.find(
          (m: CmsMediaItem) => m.id === selected.id
        );
        setSelected(refreshed || null);
      }
    }
  };

  useEffect(() => {
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setError("يرجى اختيار ملف صورة أولاً.");
      return;
    }

    setError("");
    setMessage("");
    setUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("alt", uploadAlt || uploadFile.name);
      formData.append("name", uploadName || uploadFile.name);

      setUploadProgress(65);
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      setUploadProgress(95);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "تعذر رفع الصورة.");
        return;
      }

      setUploadProgress(100);
      setMessage(data.message || "تم رفع الصورة وفحص توقيعها بنجاح.");
      setUploadFile(null);
      setUploadAlt("");
      setUploadName("");
      await loadMedia();
      if (data.item) setSelected(data.item);
    } catch {
      setError("حدث خطأ أثناء رفع الصورة.");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 600);
    }
  };

  const handleUpdateMeta = async () => {
    if (!selected) return;
    setError("");
    setMessage("");

    const res = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_meta",
        id: selected.id,
        name: selected.name,
        alt: selected.alt,
        focalX: selected.focalX,
        focalY: selected.focalY,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر تحديث بيانات الصورة.");
      return;
    }
    setMessage(data.message || "تم تحديث بيانات الصورة ونقطة التركيز.");
    await loadMedia();
  };

  const handleReplaceUsages = async () => {
    if (!selected || !replaceTargetId) return;
    setError("");
    setMessage("");

    const res = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "replace",
        oldMediaId: selected.id,
        newMediaId: replaceTargetId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر استبدال الصورة.");
      return;
    }
    setMessage(data.message || "تم استبدال الصورة في جميع المواضع بنجاح.");
    await loadMedia();
  };

  const handleDeleteMedia = async (id: string) => {
    setError("");
    setMessage("");
    const res = await fetch(`/api/admin/media?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر حذف الصورة.");
      return;
    }
    setMessage(data.message || "تم حذف الصورة.");
    if (selected?.id === id) setSelected(null);
    await loadMedia();
  };

  const handleFocalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selected || !focalStageRef.current) return;
    const rect = focalStageRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setSelected({
      ...selected,
      focalX: Math.max(0, Math.min(100, x)),
      focalY: Math.max(0, Math.min(100, y)),
    });
  };

  return (
    <AdminShell
      title="مكتبة الوسائط والصور"
      subtitle="رفع الصور، فحص التوقيع الرقمي للملفات، تحديد نقطة التركيز، وحماية الصور المستخدمة"
    >
      {error ? (
        <div className="admin-alert admin-alert--error" role="alert">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="admin-alert" role="status">
          {message}
        </div>
      ) : null}

      <section className="admin-card">
        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
          رفع صورة جديدة (JPEG / PNG / WEBP / AVIF — حد أقصى 8MB)
        </h2>

        <form onSubmit={handleUploadSubmit} className="admin-form-grid">
          <div className="admin-form-grid admin-form-grid--2">
            <div className="admin-field">
              <label className="admin-label" htmlFor="media-file-input">
                اختر ملف الصورة
              </label>
              <input
                id="media-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="admin-input"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setUploadFile(f);
                  if (f && !uploadName) setUploadName(f.name);
                }}
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="media-alt-input">
                النص البديل للصورة (Alt Text بالعربية)
              </label>
              <input
                id="media-alt-input"
                className="admin-input"
                value={uploadAlt}
                onChange={(e) => setUploadAlt(e.target.value)}
                placeholder="وصف واضح للصورة لقارئات الشاشة ومحركات البحث"
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="media-name-input">
              اسم الصورة التعريفي
            </label>
            <input
              id="media-name-input"
              className="admin-input"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
            />
          </div>

          {uploadProgress > 0 ? (
            <div
              style={{
                inlineSize: "100%",
                blockSize: "0.6rem",
                backgroundColor: "var(--color-tag-bg)",
                borderRadius: "999px",
                overflow: "hidden",
              }}
              role="progressbar"
              aria-valuenow={uploadProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                style={{
                  inlineSize: `${uploadProgress}%`,
                  blockSize: "100%",
                  backgroundColor: "var(--color-teal)",
                  transition: "width 180ms ease",
                }}
              />
            </div>
          ) : null}

          <div>
            <button
              type="submit"
              disabled={uploading}
              className="admin-btn admin-btn--primary"
            >
              {uploading ? "جاري الفحص والرفع..." : "رفع وحفظ في المكتبة"}
            </button>
          </div>
        </form>
      </section>

      <div className="admin-form-grid admin-form-grid--2">
        <section className="admin-card">
          <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
            الصور المسجلة ({mediaList.length})
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(11.5rem, 1fr))",
              gap: "0.85rem",
            }}
          >
            {mediaList.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelected(structuredClone(m))}
                style={{
                  border:
                    selected?.id === m.id
                      ? "2px solid var(--color-teal)"
                      : "1.5px solid var(--color-border)",
                  borderRadius: "var(--control-radius)",
                  padding: "0.6rem",
                  backgroundColor: "var(--color-card-bg)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.45rem",
                }}
              >
                <div
                  style={{
                    aspectRatio: "16 / 10",
                    borderRadius: "0.35rem",
                    overflow: "hidden",
                    backgroundColor: "var(--color-white)",
                  }}
                >
                  <img
                    src={m.url}
                    alt={m.alt}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: `${m.focalX}% ${m.focalY}%`,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "var(--text-caption)",
                    fontWeight: 700,
                    color: "var(--color-navy)",
                    wordBreak: "break-word",
                  }}
                >
                  {m.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.25rem",
                  }}
                >
                  <span className="admin-badge">
                    مستخدمة في: {(m.usedIn || []).length}
                  </span>
                  {!m.isPublic ? (
                    <span className="admin-badge admin-badge--review">
                      مسودة محمية
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card">
          {selected ? (
            <>
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                تفاصيل الصورة ونقطة التركيز
              </h2>

              <p className="admin-hint">
                انقر على الصورة لتحديد نقطة التركيز (Focal Point) للديسكتوب
                والموبايل: ({selected.focalX}% , {selected.focalY}%)
              </p>

              <div
                ref={focalStageRef}
                className="admin-focal-stage"
                onClick={handleFocalClick}
                title="انقر لتغيير نقطة التركيز"
              >
                <img
                  src={selected.url}
                  alt={selected.alt}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: `${selected.focalX}% ${selected.focalY}%`,
                  }}
                />
                <span
                  className="admin-focal-pin"
                  style={{
                    left: `${selected.focalX}%`,
                    top: `${selected.focalY}%`,
                  }}
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">الاسم التعريفي</label>
                <input
                  className="admin-input"
                  value={selected.name}
                  onChange={(e) =>
                    setSelected({ ...selected, name: e.target.value })
                  }
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">النص البديل (Alt Text)</label>
                <input
                  className="admin-input"
                  value={selected.alt}
                  onChange={(e) =>
                    setSelected({ ...selected, alt: e.target.value })
                  }
                />
              </div>

              <div>
                <strong style={{ fontSize: "var(--text-small)" }}>
                  الأماكن المستخدمة فيها حالياً:
                </strong>
                {(selected.usedIn || []).length === 0 ? (
                  <p className="admin-hint">
                    غير مستخدمة حالياً في أي قسم أو مقال.
                  </p>
                ) : (
                  <ul
                    style={{
                      paddingInlineStart: "1.2rem",
                      fontSize: "var(--text-small)",
                      color: "var(--color-paragraph)",
                    }}
                  >
                    {(selected.usedIn || []).map((place, idx) => (
                      <li key={idx}>{place.label}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="admin-btn-group">
                <button
                  type="button"
                  onClick={handleUpdateMeta}
                  className="admin-btn admin-btn--primary"
                >
                  حفظ تعديلات الصورة ونقطة التركيز
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteMedia(selected.id)}
                  className="admin-btn"
                >
                  حذف الصورة
                </button>
              </div>

              <div
                className="admin-card admin-card--tinted"
                style={{ padding: "1rem", marginBlockStart: "0.5rem" }}
              >
                <strong style={{ fontSize: "var(--text-small)" }}>
                  استبدال هذه الصورة بصورة أخرى في كافة الأقسام والمقالات قبل
                  الحذف:
                </strong>
                <select
                  className="admin-select"
                  value={replaceTargetId}
                  onChange={(e) => setReplaceTargetId(e.target.value)}
                >
                  <option value="">— اختر الصورة البديلة —</option>
                  {mediaList
                    .filter((m) => m.id !== selected.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.url})
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  disabled={!replaceTargetId}
                  onClick={handleReplaceUsages}
                  className="admin-btn admin-btn--navy"
                >
                  استبدال في جميع المواضع
                </button>
              </div>
            </>
          ) : (
            <p style={{ color: "var(--color-secondary)" }}>
              اختر صورة من القائمة لعرض أماكن استخدامها أو تعديل النص البديل
              ونقطة التركيز أو استبدالها.
            </p>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
