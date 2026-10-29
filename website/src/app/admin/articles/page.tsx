"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import type {
  CmsArticle,
  CmsArticleSection,
  CmsArticleStatus,
  CmsMediaItem,
  CmsRevision,
} from "@/lib/cms/types";

function createBlankArticle(): CmsArticle {
  return {
    id: "",
    slug: "",
    title: "",
    excerpt: "",
    category: "العين والجفون",
    status: "draft",
    featured: false,
    updatedAt: new Date().toISOString(),
    updatedBy: null,
    publishedAt: null,
    approvedBy: null,
    approvedAt: null,
    image: {
      src: "/media/article-consultation-prep.png",
      alt: "",
      focalX: 50,
      focalY: 50,
    },
    author: "فريق التحرير الطبي",
    reviewedBy: null,
    reviewedAt: null,
    body: [
      {
        id: "intro",
        heading: "مقدمة المقال",
        paragraphs: [""],
        bullets: [],
      },
    ],
    sources: [
      {
        title: "التثقيف الصحي للمرضى — وزارة الصحة السعودية",
        institution: "وزارة الصحة السعودية (MOH)",
        url: "https://www.moh.gov.sa/HealthAwareness/EducationalContent/Pages/default.aspx",
      },
    ],
    seo: {
      title: "",
      description: "",
      ogImage: "/media/article-consultation-prep.png",
    },
    disclaimer:
      "هذه المادة مخصصة للتثقيف الصحي العام فقط، ولا تمثل تشخيصًا شخصيًا أو توصية علاجية ولا تُغني عن الفحص الطبي المباشر.",
    deletedAt: null,
    version: 1,
  };
}

function AdminArticlesInner() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<
    Array<CmsArticle & { readingTimeMinutes?: number }>
  >([]);
  const [mediaList, setMediaList] = useState<CmsMediaItem[]>([]);
  const [userRole, setUserRole] = useState<"admin" | "editor">("editor");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showDeleted, setShowDeleted] = useState(false);

  const [editing, setEditing] = useState<CmsArticle | null>(null);
  const [approveCheckbox, setApproveCheckbox] = useState(false);
  const [originalSlug, setOriginalSlug] = useState<string>("");
  const [revisions, setRevisions] = useState<CmsRevision[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadArticles = async () => {
    const [authRes, artRes, mediaRes] = await Promise.all([
      fetch("/api/admin/auth", { cache: "no-store" }),
      fetch("/api/admin/articles?includeDeleted=true", { cache: "no-store" }),
      fetch("/api/admin/media", { cache: "no-store" }),
    ]);

    const authData = await authRes.json();
    if (authData.user?.role) setUserRole(authData.user.role);

    const artData = await artRes.json();
    if (artData.articles) setArticles(artData.articles);

    const mediaData = await mediaRes.json();
    if (mediaData.media) setMediaList(mediaData.media);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    if (searchParams?.get("new") === "1" && !editing) {
      setEditing(createBlankArticle());
      setApproveCheckbox(false);
      setOriginalSlug("");
    }
    const editSlug = searchParams?.get("edit");
    if (editSlug && articles.length > 0 && !editing) {
      const found = articles.find((a) => a.slug === editSlug);
      if (found) {
        openArticleEditor(found);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, articles]);

  const openArticleEditor = async (article: CmsArticle) => {
    setEditing(structuredClone(article));
    setApproveCheckbox(Boolean(article.approvedAt));
    setOriginalSlug(article.slug);
    setError("");
    setMessage("");
    if (article.id) {
      const revRes = await fetch(
        `/api/admin/revisions?entityType=article&entityId=${encodeURIComponent(
          article.id
        )}`,
        { cache: "no-store" }
      );
      const revData = await revRes.json();
      setRevisions(revData.revisions || []);
    } else {
      setRevisions([]);
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (!showDeleted && a.deletedAt) return false;
      if (showDeleted && !a.deletedAt) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (categoryFilter !== "all" && a.category !== categoryFilter)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          a.title.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [articles, showDeleted, statusFilter, categoryFilter, searchQuery]);

  const handleSaveArticle = async (targetStatus?: CmsArticleStatus) => {
    if (!editing) return;
    const statusToSave = targetStatus ?? editing.status;

    if (statusToSave === "published") {
      if (userRole !== "admin") {
        setError("صلاحية النشر العام مقتصرة على مدير النظام فقط.");
        return;
      }
      if (!approveCheckbox && !editing.approvedAt) {
        setError(
          "يجب تفعيل مربع الاعتماد الطبي الصريح قبل نشر المقال للجمهور."
        );
        return;
      }
      if (
        !window.confirm(
          "هل تؤكد اعتماد ونشر هذا المقال الطبي ليظهر للزوار وفي خريطة الموقع؟"
        )
      ) {
        return;
      }
    }

    if (
      originalSlug &&
      originalSlug !== editing.slug &&
      editing.publishedAt &&
      !window.confirm(
        `تنبيه: تغيير الرابط المختصر من (${originalSlug}) إلى (${editing.slug}) لمقال منشور سيقوم بإنشاء تحويل تلقائي (Redirect 308) للرابط القديم. هل تود المتابعة؟`
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const isExisting = Boolean(
        editing.id && articles.some((a) => a.id === editing.id)
      );
      const payload = {
        ...(isExisting ? { id: editing.id } : {}),
        slug: editing.slug,
        title: editing.title,
        excerpt: editing.excerpt,
        category: editing.category,
        featured: editing.featured,
        image: editing.image,
        body: editing.body,
        author: editing.author,
        reviewedBy: editing.reviewedBy,
        status: statusToSave,
        approveMedicalContent: approveCheckbox,
        seo: editing.seo,
        sources: editing.sources,
        disclaimer: editing.disclaimer,
        expectedVersion: isExisting ? editing.version : undefined,
      };
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر حفظ المقال.");
        return;
      }
      setMessage(data.message || "تم حفظ المقال بنجاح.");
      setEditing(data.article);
      setApproveCheckbox(Boolean(data.article.approvedAt));
      setOriginalSlug(data.article.slug);
      if (data.revisions) setRevisions(data.revisions);
      await loadArticles();
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async (articleId: string, restore = false) => {
    if (
      !restore &&
      !window.confirm(
        "هل تريد نقل هذا المقال إلى سلة المحذوفات (حذف ناعم قابل للاسترجاع)؟"
      )
    ) {
      return;
    }
    const res = await fetch(
      `/api/admin/articles?id=${encodeURIComponent(articleId)}${
        restore ? "&restore=true" : ""
      }`,
      { method: "DELETE" }
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر تنفيذ العملية.");
      return;
    }
    setMessage(data.message);
    if (editing?.id === articleId) {
      setEditing(null);
    }
    await loadArticles();
  };

  const handleRestoreRevision = async (revisionId: string) => {
    if (!window.confirm("هل تريد استرجاع هذه النسخة السابقة من المقال؟")) return;
    const res = await fetch("/api/admin/revisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revisionId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر استرجاع النسخة.");
      return;
    }
    setMessage(data.message);
    await loadArticles();
    if (editing?.id) {
      const updatedRes = await fetch(
        `/api/admin/articles?id=${encodeURIComponent(editing.id)}`
      ).then((r) => r.json());
      if (updatedRes.article) {
        setEditing(updatedRes.article);
        setRevisions(updatedRes.revisions || []);
      }
    }
  };

  const addSection = () => {
    if (!editing) return;
    const nextSec: CmsArticleSection = {
      id: `sec-${Date.now()}`,
      heading: "عنوان قسم جديد",
      paragraphs: [""],
      bullets: [],
    };
    setEditing({
      ...editing,
      body: [...editing.body, nextSec],
    });
  };

  return (
    <AdminShell
      title="إدارة المقالات والمحتوى الطبي"
      subtitle="إنشاء وتحرير المقالات، المراجعة الطبية، التحكم في الحالة، وسجل النسخ"
      actions={
        <div className="admin-btn-group">
          {editing ? (
            <button
              type="button"
              className="admin-btn"
              onClick={() => setEditing(null)}
            >
              ← العودة لقائمة المقالات
            </button>
          ) : (
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => {
                setEditing(createBlankArticle());
                setApproveCheckbox(false);
                setOriginalSlug("");
                setError("");
                setMessage("");
              }}
            >
              + مقال طبي جديد
            </button>
          )}
        </div>
      }
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

      {!editing ? (
        <section className="admin-card">
          <div className="admin-form-grid admin-form-grid--2">
            <div className="admin-field">
              <label className="admin-label" htmlFor="article-search">
                بحث في العنوان أو الرابط أو الملخص
              </label>
              <input
                id="article-search"
                className="admin-input"
                placeholder="ابحث عن مقال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="admin-btn-group" style={{ alignSelf: "end" }}>
              <select
                aria-label="تصفية حسب الحالة"
                className="admin-select"
                style={{ width: "auto" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">كل الحالات</option>
                <option value="published">منشور</option>
                <option value="in_review">قيد المراجعة</option>
                <option value="draft">مسودة</option>
                <option value="archived">مؤرشف</option>
              </select>

              <select
                aria-label="تصفية حسب التصنيف"
                className="admin-select"
                style={{ width: "auto" }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">كل التصنيفات</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className={`admin-btn ${
                  showDeleted ? "admin-btn--primary" : ""
                }`}
                onClick={() => setShowDeleted((prev) => !prev)}
              >
                {showDeleted ? "عرض المقالات النشطة" : "سلة المحذوفات"}
              </button>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>الرابط المختصر (Slug)</th>
                  <th>التصنيف</th>
                  <th>وقت القراءة</th>
                  <th>الحالة</th>
                  <th>الاعتماد الطبي</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((art) => (
                  <tr key={art.id}>
                    <td style={{ fontWeight: 700 }}>{art.title}</td>
                    <td dir="ltr">{art.slug}</td>
                    <td>{art.category}</td>
                    <td>{art.readingTimeMinutes || 2} د</td>
                    <td>
                      <span
                        className={`admin-badge ${
                          art.status === "published"
                            ? "admin-badge--published"
                            : art.status === "in_review"
                            ? "admin-badge--review"
                            : "admin-badge--draft"
                        }`}
                      >
                        {art.status === "published"
                          ? "منشور"
                          : art.status === "in_review"
                          ? "قيد المراجعة"
                          : art.status === "archived"
                          ? "مؤرشف"
                          : "مسودة"}
                      </span>
                    </td>
                    <td>
                      {art.approvedAt ? (
                        <span className="admin-badge admin-badge--published">
                          معتمد طبياً
                        </span>
                      ) : (
                        <span className="admin-badge">غير معتمد</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-btn-group">
                        {!art.deletedAt ? (
                          <>
                            <button
                              type="button"
                              className="admin-btn"
                              onClick={() => openArticleEditor(art)}
                            >
                              تحرير
                            </button>
                            <a
                              href={`/ar/journal/${art.slug}?preview=1`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-btn"
                            >
                              معاينة
                            </a>
                            {userRole === "admin" ? (
                              <button
                                type="button"
                                className="admin-btn"
                                onClick={() => handleSoftDelete(art.id, false)}
                              >
                                حذف
                              </button>
                            ) : null}
                          </>
                        ) : (
                          <button
                            type="button"
                            className="admin-btn admin-btn--primary"
                            onClick={() => handleSoftDelete(art.id, true)}
                          >
                            استرجاع من المحذوفات
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="admin-card">
          <div className="admin-toolbar">
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
              تحرير المقال: {editing.title || "مقال جديد"}
            </h2>
            <div className="admin-btn-group">
              <button
                type="button"
                disabled={saving}
                className="admin-btn"
                onClick={() => handleSaveArticle("draft")}
              >
                حفظ كمسودة
              </button>
              <button
                type="button"
                disabled={saving}
                className="admin-btn admin-btn--navy"
                onClick={() => handleSaveArticle("in_review")}
              >
                إرسال للمراجعة
              </button>
              {userRole === "admin" ? (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    className="admin-btn admin-btn--primary"
                    onClick={() => handleSaveArticle("published")}
                  >
                    اعتماد ونشر المقال
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    className="admin-btn"
                    onClick={() => handleSaveArticle("archived")}
                  >
                    أرشفة
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            <div className="admin-field">
              <label className="admin-label" htmlFor="edit-title">
                عنوان المقال
              </label>
              <input
                id="edit-title"
                className="admin-input"
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="edit-slug">
                الرابط المختصر (Slug — حروف إنجليزية وأرقام وشرطات)
              </label>
              <input
                id="edit-slug"
                dir="ltr"
                className="admin-input"
                value={editing.slug}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-_]/g, "-"),
                  })
                }
                placeholder="example-eyelid-guide"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="edit-category">
                التصنيف
              </label>
              <select
                id="edit-category"
                className="admin-select"
                value={editing.category}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    category: e.target.value as CmsArticle["category"],
                  })
                }
              >
                <option value="العين والجفون">العين والجفون</option>
                <option value="التحضير للاستشارة">التحضير للاستشارة</option>
                <option value="أسئلة شائعة موسعة">أسئلة شائعة موسعة</option>
              </select>
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="edit-author">
                الكاتب / جهة الإعداد
              </label>
              <input
                id="edit-author"
                className="admin-input"
                value={editing.author || ""}
                onChange={(e) =>
                  setEditing({ ...editing, author: e.target.value })
                }
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="edit-excerpt">
              ملخص المقال
            </label>
            <textarea
              id="edit-excerpt"
              className="admin-textarea"
              value={editing.excerpt}
              onChange={(e) =>
                setEditing({ ...editing, excerpt: e.target.value })
              }
            />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="edit-reviewer">
              المراجع الطبي (لا يُفترض تلقائياً أن د. ريهام راجعت المحتوى ما لم
              يُكتب صراحة)
            </label>
            <input
              id="edit-reviewer"
              className="admin-input"
              value={editing.reviewedBy || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  reviewedBy: e.target.value || null,
                })
              }
              placeholder="يُترك فارغاً حتى تتم المراجعة الطبية الفعلية"
            />
          </div>

          {userRole === "admin" ? (
            <div
              className="admin-card admin-card--tinted"
              style={{ padding: "1rem" }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <input
                  id="edit-content-approved"
                  type="checkbox"
                  checked={approveCheckbox}
                  onChange={(e) => setApproveCheckbox(e.target.checked)}
                  style={{ width: "1.2rem", height: "1.2rem" }}
                />
                <span>
                  اعتماد صريح للمحتوى الطبي من المدير للظهور في الموقع العام
                </span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) =>
                    setEditing({ ...editing, featured: e.target.checked })
                  }
                  style={{ width: "1.1rem", height: "1.1rem" }}
                />
                <span>تمييز المقال في الصفحة الرئيسية</span>
              </label>
            </div>
          ) : null}

          <div className="admin-form-grid admin-form-grid--2">
            <div className="admin-field">
              <label className="admin-label" htmlFor="edit-image">
                الصورة الرئيسية للمقال
              </label>
              <select
                id="edit-image"
                className="admin-select"
                value={editing.image.src}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    image: { ...editing.image, src: e.target.value },
                  })
                }
              >
                {mediaList.map((m) => (
                  <option key={m.id} value={m.url}>
                    {m.name} ({m.url})
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="edit-image-alt">
                النص البديل للصورة (Alt Text)
              </label>
              <input
                id="edit-image-alt"
                className="admin-input"
                value={editing.image.alt}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    image: { ...editing.image, alt: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="admin-toolbar">
            <h3 style={{ fontSize: "1.15rem", margin: 0 }}>
              أقسام المحتوى الكامل ({editing.body.length})
            </h3>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={addSection}
            >
              + إضافة قسم للمقال
            </button>
          </div>

          {editing.body.map((sec, sIdx) => (
            <div
              key={sec.id || sIdx}
              className="admin-card admin-card--tinted"
              style={{ padding: "1.15rem" }}
            >
              <div className="admin-toolbar">
                <strong style={{ color: "var(--color-navy)" }}>
                  القسم {sIdx + 1}
                </strong>
                {editing.body.length > 1 ? (
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => {
                      const next = editing.body.filter((_, i) => i !== sIdx);
                      setEditing({ ...editing, body: next });
                    }}
                  >
                    حذف القسم
                  </button>
                ) : null}
              </div>

              <div className="admin-field">
                <label className="admin-label">عنوان القسم الفرعي</label>
                <input
                  className="admin-input"
                  value={sec.heading}
                  onChange={(e) => {
                    const next = [...editing.body];
                    next[sIdx] = { ...next[sIdx], heading: e.target.value };
                    setEditing({ ...editing, body: next });
                  }}
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">
                  الفقرات (فقرة في كل سطر مزدوج)
                </label>
                <textarea
                  className="admin-textarea"
                  value={sec.paragraphs.join("\n\n")}
                  onChange={(e) => {
                    const next = [...editing.body];
                    next[sIdx] = {
                      ...next[sIdx],
                      paragraphs: e.target.value
                        .split(/\n\s*\n/)
                        .map((p) => p.trim())
                        .filter(Boolean),
                    };
                    setEditing({ ...editing, body: next });
                  }}
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">
                  قائمة النقاط (نقطة في كل سطر — اختياري)
                </label>
                <textarea
                  className="admin-textarea"
                  style={{ minBlockSize: "4.5rem" }}
                  value={(sec.bullets || []).join("\n")}
                  onChange={(e) => {
                    const next = [...editing.body];
                    next[sIdx] = {
                      ...next[sIdx],
                      bullets: e.target.value
                        .split("\n")
                        .map((b) => b.trim())
                        .filter(Boolean),
                    };
                    setEditing({ ...editing, body: next });
                  }}
                />
              </div>
            </div>
          ))}

          <h3 style={{ fontSize: "1.15rem", margin: 0 }}>حقول SEO والمشاركة</h3>
          <div className="admin-form-grid admin-form-grid--2">
            <div className="admin-field">
              <label className="admin-label">عنوان الميتا (SEO Title)</label>
              <input
                className="admin-input"
                value={editing.seo.title || ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    seo: { ...editing.seo, title: e.target.value },
                  })
                }
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">
                وصف الميتا (SEO Description)
              </label>
              <input
                className="admin-input"
                value={editing.seo.description || ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    seo: { ...editing.seo, description: e.target.value },
                  })
                }
              />
            </div>
          </div>

          {revisions.length > 0 ? (
            <div style={{ marginBlockStart: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", marginBlockEnd: "0.5rem" }}>
                سجل تعديلات المقال ({revisions.length})
              </h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>الإصدار</th>
                      <th>الوصف</th>
                      <th>المنفذ</th>
                      <th>التاريخ</th>
                      <th>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revisions.map((rev) => (
                      <tr key={rev.id}>
                        <td>v{rev.version}</td>
                        <td>{rev.summary}</td>
                        <td>{rev.actorName}</td>
                        <td dir="ltr">
                          {new Date(rev.createdAt).toLocaleString("ar-SA")}
                        </td>
                        <td>
                          {userRole === "admin" ? (
                            <button
                              type="button"
                              className="admin-btn"
                              onClick={() => handleRestoreRevision(rev.id)}
                            >
                              استرجاع هذه النسخة
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      )}
    </AdminShell>
  );
}

export default function AdminArticlesPage() {
  return (
    <Suspense
      fallback={
        <AdminShell title="إدارة المقالات الطبية">
          <div className="admin-card">جاري تحميل المقالات...</div>
        </AdminShell>
      }
    >
      <AdminArticlesInner />
    </Suspense>
  );
}
