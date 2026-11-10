/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import type {
  CmsMediaItem,
  CmsPageRecord,
  CmsRevision,
  HomePageCmsData,
  HomeSectionKey,
  ResultsCaseItem,
} from "@/lib/cms/types";

const SECTION_LABELS: Record<HomeSectionKey, string> = {
  specialtiesStrip: "شريط التخصصات الأربعة",
  doctorIntro: "قسم عن الدكتورة (التخصص الدقيق والركائز)",
  resultsSection: "قسم النتائج الموثقة (قبل / بعد — مشروط)",
  specialtySection: "قسم مجالات التخصص التفصيلية",
  beforeConsultationSection: "قسم ما قبل الاستشارة",
  knowledgeSection: "قسم التثقيف الطبي والمقالات",
  contentStyleSection: "قسم أسلوب المحتوى التوعوي",
  faqSection: "قسم الأسئلة الشائعة",
  finalInquiry: "قسم التواصل النهائي",
};

export default function AdminPagesEditor() {
  const [pageRecord, setPageRecord] = useState<CmsPageRecord | null>(null);
  const [draft, setDraft] = useState<HomePageCmsData | null>(null);
  const [mediaList, setMediaList] = useState<CmsMediaItem[]>([]);
  const [revisions, setRevisions] = useState<CmsRevision[]>([]);
  const [activeTab, setActiveTab] = useState<
    | "hero"
    | "specialtiesStrip"
    | "doctorIntro"
    | "resultsSection"
    | "specialtySection"
    | "beforeConsultationSection"
    | "knowledgeSection"
    | "contentStyleSection"
    | "faqSection"
    | "finalInquiry"
    | "headerFooter"
    | "englishContent"
    | "order"
    | "revisions"
  >("hero");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "editor">("editor");

  const loadData = async () => {
    const [authRes, pageRes, mediaRes] = await Promise.all([
      fetch("/api/admin/auth", { cache: "no-store" }),
      fetch("/api/admin/pages", { cache: "no-store" }),
      fetch("/api/admin/media", { cache: "no-store" }),
    ]);

    const authData = await authRes.json();
    if (authData.user?.role) {
      setUserRole(authData.user.role);
    }

    const pageData = await pageRes.json();
    if (pageData.page) {
      setPageRecord(pageData.page);
      setDraft(structuredClone(pageData.page.draftData));
      setDirty(false);
    }
    if (pageData.revisions) {
      setRevisions(pageData.revisions);
    }

    const mediaData = await mediaRes.json();
    if (mediaData.media) {
      setMediaList(mediaData.media);
    }
  };

  useEffect(() => {
    loadData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "resultsSection") {
        setActiveTab("resultsSection");
      }
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const updateDraft = (updater: (prev: HomePageCmsData) => HomePageCmsData) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = updater(structuredClone(prev));
      setDirty(true);
      return next;
    });
  };

  const handleSaveDraft = async () => {
    if (!draft || !pageRecord) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_draft",
          draftData: draft,
          expectedVersion: pageRecord.version,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر حفظ المسودة.");
        return;
      }
      setPageRecord(data.page);
      setDraft(structuredClone(data.page.draftData));
      if (data.revisions) setRevisions(data.revisions);
      setDirty(false);
      setMessage(data.message || "تم حفظ المسودة في قاعدة البيانات بنجاح.");
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!draft || !pageRecord) return;
    if (
      !window.confirm(
        "هل أنت متأكد من نشر التعديلات على الصفحة الرئيسية للموقع العام فوراً؟"
      )
    ) {
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          draftData: draft,
          expectedVersion: pageRecord.version,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر نشر التغييرات.");
        return;
      }
      setPageRecord(data.page);
      setDraft(structuredClone(data.page.draftData));
      if (data.revisions) setRevisions(data.revisions);
      setDirty(false);
      setMessage(data.message || "تم نشر تعديلات الصفحة الرئيسية بنجاح.");
    } catch {
      setError("حدث خطأ أثناء النشر.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async (locale: "ar" | "en" = "ar") => {
    if (dirty) {
      await handleSaveDraft();
    }
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_preview", enable: true }),
    });
    window.open(`/${locale}?preview=1`, "_blank", "noopener,noreferrer");
  };

  const handleRestoreRevision = async (revisionId: string) => {
    if (!window.confirm("هل تريد استرجاع هذه النسخة السابقة؟")) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
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
      setMessage(data.message || "تم استرجاع النسخة بنجاح.");
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    updateDraft((prev) => {
      const list = [...prev.sectionOrder];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      prev.sectionOrder = list;
      return prev;
    });
  };

  const toggleSectionEnabled = (key: HomeSectionKey) => {
    updateDraft((prev) => {
      prev.sectionVisibility = {
        ...prev.sectionVisibility,
        [key]: !prev.sectionVisibility[key],
      };
      return prev;
    });
  };

  const addResultsCase = () => {
    updateDraft((prev) => {
      if (!prev.resultsSection) return prev;
      const cases = [...(prev.resultsSection.cases || [])];
      const nextIndex = cases.length + 1;
      const newCase: ResultsCaseItem = {
        id: `case-${Date.now()}`,
        titleAr: `حالة جراحة وتجميل الجفون (${nextIndex})`,
        titleEn: `Eyelid & Oculoplastic Case (${nextIndex})`,
        captionAr: "تقييم دقيق وتحسّن متوازن يحترم سلامة العين والوظيفة الطبيعية للجفن.",
        captionEn:
          "Careful anatomical assessment and balanced improvement respecting ocular safety and natural eyelid function.",
        beforeImageSrc: "/images/hero-eye-plum-ivory.jpg",
        afterImageSrc: "/images/article-eyelid-indication.jpg",
        altAr: `حالة جراحة وتجميل الجفون (${nextIndex})`,
        altEn: `Eyelid & Oculoplastic Case (${nextIndex})`,
        beforeAltAr: "صورة الجفن قبل الإجراء العلاجي",
        beforeAltEn: "Eyelid appearance before treatment",
        afterAltAr: "صورة الجفن بعد الإجراء العلاجي",
        afterAltEn: "Eyelid appearance after treatment",
        beforeFocalPoint: "50% 48%",
        afterFocalPoint: "50% 48%",
        sortOrder: nextIndex,
        status: "draft",
        consentConfirmed: false,
        approvedByDoctor: false,
        published: false,
      };
      cases.push(newCase);
      prev.resultsSection.cases = cases;
      return prev;
    });
  };

  const deleteResultsCase = (caseIdx: number) => {
    if (!window.confirm("هل تريد حذف هذه الحالة من قائمة قبل وبعد؟")) return;
    updateDraft((prev) => {
      if (!prev.resultsSection) return prev;
      const cases = [...(prev.resultsSection.cases || [])];
      cases.splice(caseIdx, 1);
      prev.resultsSection.cases = cases.map((item, idx) => ({
        ...item,
        sortOrder: idx + 1,
      }));
      return prev;
    });
  };

  const moveResultsCase = (caseIdx: number, direction: -1 | 1) => {
    updateDraft((prev) => {
      if (!prev.resultsSection) return prev;
      const cases = [...(prev.resultsSection.cases || [])];
      const targetIdx = caseIdx + direction;
      if (targetIdx < 0 || targetIdx >= cases.length) return prev;
      const temp = cases[caseIdx];
      cases[caseIdx] = cases[targetIdx];
      cases[targetIdx] = temp;
      prev.resultsSection.cases = cases.map((item, idx) => ({
        ...item,
        sortOrder: idx + 1,
      }));
      return prev;
    });
  };

  const handleCaseImageUpload = async (
    caseIdx: number,
    slot: "before" | "after",
    file: File | null
  ) => {
    if (!file) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "name",
        slot === "before"
          ? `صورة قبل - حالة ${caseIdx + 1}`
          : `صورة بعد - حالة ${caseIdx + 1}`
      );
      formData.append(
        "alt",
        slot === "before"
          ? "صورة الجفن قبل الإجراء"
          : "صورة الجفن بعد الإجراء"
      );

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.item?.url) {
        setError(data.error || "تعذر رفع صورة الحالة.");
        return;
      }

      const uploadedItem: CmsMediaItem = data.item;
      setMediaList((prev) => [
        uploadedItem,
        ...prev.filter((m) => m.id !== uploadedItem.id),
      ]);

      updateDraft((d) => {
        if (!d.resultsSection?.cases?.[caseIdx]) return d;
        if (slot === "before") {
          d.resultsSection.cases[caseIdx].beforeImageSrc = uploadedItem.url;
        } else {
          d.resultsSection.cases[caseIdx].afterImageSrc = uploadedItem.url;
        }
        return d;
      });
      setMessage(
        slot === "before"
          ? "تم رفع «صورة قبل» وربطها بالحالة بنجاح."
          : "تم رفع «صورة بعد» وربطها بالحالة بنجاح."
      );
    } catch {
      setError("حدث خطأ أثناء رفع صورة الحالة.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="تحرير أقسام الصفحات والهيدر والفوتر (AR & EN)"
      subtitle={
        pageRecord
          ? `الإصدار الحالي: v${pageRecord.version} — آخر تحديث بواسطة ${
              pageRecord.updatedBy || "النظام"
            }`
          : "جاري التحميل..."
      }
      actions={
        <div className="admin-btn-group">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving || !draft}
            className="admin-btn"
          >
            {saving ? "جاري الحفظ..." : "حفظ كمسودة"}
          </button>
          <button
            type="button"
            onClick={() => handlePreview("ar")}
            disabled={saving || !draft}
            className="admin-btn admin-btn--navy"
          >
            معاينة قبل النشر
          </button>
          <button
            type="button"
            onClick={() => handlePreview("en")}
            disabled={saving || !draft}
            className="admin-btn admin-btn--navy"
          >
            Preview EN
          </button>
          {userRole === "admin" ? (
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving || !draft}
              className="admin-btn admin-btn--primary"
            >
              نشر التغييرات
            </button>
          ) : null}
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

      {!draft ? (
        <div className="admin-card">جاري تحميل محتوى الأقسام...</div>
      ) : (
        <>
          <div className="admin-card admin-card--tinted">
            <div className="admin-btn-group">
              {[
                { id: "hero", label: "١. الهيرو (الافتتاحية)" },
                { id: "specialtiesStrip", label: "٢. شريط التخصصات" },
                { id: "doctorIntro", label: "٣. عن الدكتورة والركائز" },
                { id: "resultsSection", label: "٤. النتائج الموثقة (قبل/بعد)" },
                { id: "knowledgeSection", label: "٥. التثقيف والمقالات" },
                { id: "specialtySection", label: "٦. التخصص التفصيلي" },
                { id: "beforeConsultationSection", label: "٧. ما قبل الاستشارة" },
                { id: "contentStyleSection", label: "٨. أسلوب المحتوى" },
                { id: "faqSection", label: "٩. الأسئلة الشائعة" },
                { id: "finalInquiry", label: "١٠. التواصل النهائي" },
                { id: "headerFooter", label: "١١. الهيدر والفوتر" },
                { id: "englishContent", label: "١٢. المحتوى الإنجليزي (EN)" },
                { id: "order", label: "ترتيب وإظهار الأقسام" },
                { id: "revisions", label: `سجل النسخ (${revisions.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`admin-btn ${
                    activeTab === tab.id ? "admin-btn--primary" : ""
                  }`.trim()}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "hero" ? (
            <section className="admin-card">
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                تحرير قسم الهيرو (الافتتاحية)
              </h2>

              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label" htmlFor="hero-doc-tag">
                    العنوان الفرعي الأول (اسم الطبيبة)
                  </label>
                  <input
                    id="hero-doc-tag"
                    className="admin-input"
                    value={draft.hero.doctorTag}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.hero.doctorTag = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="hero-spec-tag">
                    العنوان الفرعي الثاني (التخصص)
                  </label>
                  <input
                    id="hero-spec-tag"
                    className="admin-input"
                    value={draft.hero.specialtyTag}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.hero.specialtyTag = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="hero-line1">
                    السطر الأول من العنوان الرئيسي
                  </label>
                  <input
                    id="hero-line1"
                    className="admin-input"
                    value={draft.hero.headlineLine1}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.hero.headlineLine1 = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="hero-line2">
                    السطر المميز (السطر الثاني)
                  </label>
                  <input
                    id="hero-line2"
                    className="admin-input"
                    value={draft.hero.headlineLine2}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.hero.headlineLine2 = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label" htmlFor="hero-support">
                  النص التعريفي للهيرو
                </label>
                <textarea
                  id="hero-support"
                  className="admin-textarea"
                  value={draft.hero.support}
                  onChange={(e) =>
                    updateDraft((d) => {
                      d.hero.support = e.target.value;
                      return d;
                    })
                  }
                />
              </div>

              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label" htmlFor="hero-primary-cta">
                    نص الزر الأساسي
                  </label>
                  <input
                    id="hero-primary-cta"
                    className="admin-input"
                    value={draft.hero.primaryCta}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.hero.primaryCta = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="hero-primary-href">
                    رابط الزر الأساسي
                  </label>
                  <input
                    id="hero-primary-href"
                    dir="ltr"
                    className="admin-input"
                    value={draft.hero.primaryHref}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.hero.primaryHref = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="hero-sec-cta">
                    نص الزر الثانوي
                  </label>
                  <input
                    id="hero-sec-cta"
                    className="admin-input"
                    value={draft.hero.secondaryCta}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.hero.secondaryCta = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label" htmlFor="hero-sec-href">
                    رابط الزر الثانوي
                  </label>
                  <input
                    id="hero-sec-href"
                    dir="ltr"
                    className="admin-input"
                    value={draft.hero.secondaryHref}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.hero.secondaryHref = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label" htmlFor="hero-image-src">
                    صورة الهيرو
                  </label>
                  <select
                    id="hero-image-src"
                    className="admin-select"
                    value={draft.hero.image.src}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.hero.image.src = e.target.value;
                        return d;
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
                  <label className="admin-label" htmlFor="hero-image-alt">
                    النص البديل لصورة الهيرو (Alt Text)
                  </label>
                  <input
                    id="hero-image-alt"
                    className="admin-input"
                    value={draft.hero.image.alt}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.hero.image.alt = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "specialtiesStrip" && draft.specialtiesStrip ? (
            <section className="admin-card">
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                تحرير شريط التخصصات الأربعة
              </h2>
              <div className="admin-form-grid admin-form-grid--2">
                {draft.specialtiesStrip.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="admin-card admin-card--tinted"
                    style={{ padding: "1rem" }}
                  >
                    <div className="admin-field">
                      <label className="admin-label">
                        عنوان التخصص {idx + 1}
                      </label>
                      <input
                        className="admin-input"
                        value={item.title}
                        onChange={(e) =>
                          updateDraft((d) => {
                            if (d.specialtiesStrip) {
                              d.specialtiesStrip[idx].title = e.target.value;
                            }
                            return d;
                          })
                        }
                      />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">الوصف المختصر</label>
                      <input
                        className="admin-input"
                        value={item.subtitle}
                        onChange={(e) =>
                          updateDraft((d) => {
                            if (d.specialtiesStrip) {
                              d.specialtiesStrip[idx].subtitle = e.target.value;
                            }
                            return d;
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {activeTab === "doctorIntro" ? (
            <section className="admin-card">
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                تحرير قسم «عن الدكتورة» والركائز الأربع
              </h2>

              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">العنوان الفرعي</label>
                  <input
                    className="admin-input"
                    value={draft.doctorIntro.eyebrow}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.doctorIntro.eyebrow = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">الاسم</label>
                  <input
                    className="admin-input"
                    value={draft.doctorIntro.name}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.doctorIntro.name = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">التخصص الدقيق</label>
                  <input
                    className="admin-input"
                    value={draft.doctorIntro.specialty}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.doctorIntro.specialty = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">المدينة</label>
                  <input
                    className="admin-input"
                    value={draft.doctorIntro.city}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.doctorIntro.city = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label">الفقرة التعريفية البارزة</label>
                <textarea
                  className="admin-textarea"
                  value={draft.doctorIntro.leadStatement}
                  onChange={(e) =>
                    updateDraft((d) => {
                      d.doctorIntro.leadStatement = e.target.value;
                      return d;
                    })
                  }
                />
              </div>

              {draft.doctorIntro.principles ? (
                <div className="admin-form-grid admin-form-grid--2">
                  {draft.doctorIntro.principles.map((p, idx) => (
                    <div
                      key={idx}
                      className="admin-card admin-card--tinted"
                      style={{ padding: "0.85rem" }}
                    >
                      <div className="admin-field">
                        <label className="admin-label">
                          الركيزة الأيقونية {idx + 1}
                        </label>
                        <input
                          className="admin-input"
                          value={p.title}
                          onChange={(e) =>
                            updateDraft((d) => {
                              if (d.doctorIntro.principles) {
                                d.doctorIntro.principles[idx].title =
                                  e.target.value;
                              }
                              return d;
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="admin-form-grid admin-form-grid--2">
                {draft.doctorIntro.pillars.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="admin-card admin-card--tinted"
                    style={{ padding: "1rem" }}
                  >
                    <div className="admin-field">
                      <label className="admin-label">
                        عنوان البطاقة {idx + 1}
                      </label>
                      <input
                        className="admin-input"
                        value={pillar.title}
                        onChange={(e) =>
                          updateDraft((d) => {
                            d.doctorIntro.pillars[idx].title = e.target.value;
                            return d;
                          })
                        }
                      />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label">
                        نص البطاقة {idx + 1}
                      </label>
                      <textarea
                        className="admin-textarea"
                        value={pillar.text}
                        onChange={(e) =>
                          updateDraft((d) => {
                            d.doctorIntro.pillars[idx].text = e.target.value;
                            return d;
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {activeTab === "resultsSection" && draft.resultsSection ? (
            <section className="admin-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                  إدارة قسم «قبل وبعد» (حالات مختارة — مشروط بالموافقة الطبية)
                </h2>
                <button
                  type="button"
                  onClick={addResultsCase}
                  className="admin-btn admin-btn--primary"
                >
                  + إضافة حالة جديدة (قبل وبعد)
                </button>
              </div>

              <div className="admin-alert">
                ملاحظة طبية وقانونية: يظل قسم «قبل وبعد» مخفياً تلقائياً عن الزوار
                في الموقع العام طالما لم تتوفر حالة واحدة على الأقل بحالة «منشور»
                مع تفعيل إقرار موافقة المريض الصريحة واعتماد الطبيبة، ويظهر في
                «وضع المعاينة المحمي» لمعاينة الكاروسيل والتقليب التلقائي.
              </div>

              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">العنوان الفرعي (عربي)</label>
                  <input
                    className="admin-input"
                    value={draft.resultsSection.eyebrow}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.resultsSection) {
                          d.resultsSection.eyebrow = e.target.value;
                        }
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">العنوان الرئيسي (عربي)</label>
                  <input
                    className="admin-input"
                    value={draft.resultsSection.title}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.resultsSection) {
                          d.resultsSection.title = e.target.value;
                        }
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Eyebrow (English)</label>
                  <input
                    dir="ltr"
                    className="admin-input"
                    value={draft.resultsSection.eyebrowEn || ""}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.resultsSection) {
                          d.resultsSection.eyebrowEn = e.target.value;
                        }
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Title (English)</label>
                  <input
                    dir="ltr"
                    className="admin-input"
                    value={draft.resultsSection.titleEn || ""}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.resultsSection) {
                          d.resultsSection.titleEn = e.target.value;
                        }
                        return d;
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">وصف القسم (عربي)</label>
                  <textarea
                    className="admin-textarea"
                    value={draft.resultsSection.description}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.resultsSection) {
                          d.resultsSection.description = e.target.value;
                        }
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Description (English)</label>
                  <textarea
                    dir="ltr"
                    className="admin-textarea"
                    value={draft.resultsSection.descriptionEn || ""}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.resultsSection) {
                          d.resultsSection.descriptionEn = e.target.value;
                        }
                        return d;
                      })
                    }
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {(draft.resultsSection.cases || []).map((c, idx) => {
                  const isPublished =
                    (c.status === "published" || c.published) &&
                    c.consentConfirmed &&
                    c.approvedByDoctor;
                  return (
                    <div
                      key={c.id || idx}
                      className="admin-card admin-card--tinted"
                      style={{
                        padding: "1.1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.95rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "0.65rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.65rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <strong style={{ fontSize: "1.02rem" }}>
                            الحالة #{idx + 1}: {c.titleAr || "بدون عنوان"}
                          </strong>
                          <span
                            className={`admin-badge ${
                              isPublished ? "admin-badge--published" : ""
                            }`.trim()}
                          >
                            {isPublished
                              ? "منشورة ومعتمدة للعرض العام"
                              : "مسودة / معاينة داخلية فقط"}
                          </span>
                        </div>

                        <div className="admin-btn-group">
                          <button
                            type="button"
                            className="admin-btn"
                            disabled={idx === 0}
                            onClick={() => moveResultsCase(idx, -1)}
                          >
                            ↑ للأعلى
                          </button>
                          <button
                            type="button"
                            className="admin-btn"
                            disabled={
                              idx ===
                              (draft.resultsSection?.cases.length || 1) - 1
                            }
                            onClick={() => moveResultsCase(idx, 1)}
                          >
                            ↓ للأسفل
                          </button>
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={() => deleteResultsCase(idx)}
                          >
                            حذف الحالة
                          </button>
                        </div>
                      </div>

                      <div className="admin-form-grid admin-form-grid--2">
                        <div className="admin-field">
                          <label className="admin-label">
                            عنوان الحالة بالعربية (اختياري)
                          </label>
                          <input
                            className="admin-input"
                            value={c.titleAr}
                            onChange={(e) =>
                              updateDraft((d) => {
                                if (d.resultsSection?.cases?.[idx]) {
                                  d.resultsSection.cases[idx].titleAr =
                                    e.target.value;
                                }
                                return d;
                              })
                            }
                          />
                        </div>

                        <div className="admin-field">
                          <label className="admin-label">
                            Case Title in English (Optional)
                          </label>
                          <input
                            dir="ltr"
                            className="admin-input"
                            value={c.titleEn}
                            onChange={(e) =>
                              updateDraft((d) => {
                                if (d.resultsSection?.cases?.[idx]) {
                                  d.resultsSection.cases[idx].titleEn =
                                    e.target.value;
                                }
                                return d;
                              })
                            }
                          />
                        </div>

                        <div className="admin-field">
                          <label className="admin-label">
                            وصف مختصر للحالة بالعربية (اختياري)
                          </label>
                          <textarea
                            className="admin-textarea"
                            value={c.captionAr || ""}
                            onChange={(e) =>
                              updateDraft((d) => {
                                if (d.resultsSection?.cases?.[idx]) {
                                  d.resultsSection.cases[idx].captionAr =
                                    e.target.value;
                                }
                                return d;
                              })
                            }
                          />
                        </div>

                        <div className="admin-field">
                          <label className="admin-label">
                            Case Description in English (Optional)
                          </label>
                          <textarea
                            dir="ltr"
                            className="admin-textarea"
                            value={c.captionEn || ""}
                            onChange={(e) =>
                              updateDraft((d) => {
                                if (d.resultsSection?.cases?.[idx]) {
                                  d.resultsSection.cases[idx].captionEn =
                                    e.target.value;
                                }
                                return d;
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="admin-form-grid admin-form-grid--2">
                        {/* BEFORE IMAGE PANEL */}
                        <div
                          className="admin-card"
                          style={{ padding: "0.95rem", gap: "0.65rem" }}
                        >
                          <strong style={{ fontSize: "0.95rem" }}>
                            ١. صورة «قبل» (Before Image)
                          </strong>

                          <div
                            style={{
                              position: "relative",
                              aspectRatio: "16 / 10",
                              borderRadius: "10px",
                              overflow: "hidden",
                              background: "#2E1426",
                              cursor: "crosshair",
                            }}
                            title="انقر على الصورة لضبط نقطة التركيز (Focal Point)"
                            onClick={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const x = Math.round(
                                ((e.clientX - rect.left) / rect.width) * 100
                              );
                              const y = Math.round(
                                ((e.clientY - rect.top) / rect.height) * 100
                              );
                              updateDraft((d) => {
                                if (d.resultsSection?.cases?.[idx]) {
                                  d.resultsSection.cases[
                                    idx
                                  ].beforeFocalPoint = `${x}% ${y}%`;
                                }
                                return d;
                              });
                            }}
                          >
                            <img
                              src={c.beforeImageSrc}
                              alt={c.beforeAltAr || "صورة قبل"}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition:
                                  c.beforeFocalPoint || "50% 48%",
                              }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                bottom: "0.5rem",
                                right: "0.5rem",
                                background: "rgba(119, 115, 79, 0.92)",
                                color: "#FBF7F3",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                padding: "0.2rem 0.6rem",
                                borderRadius: "6px",
                              }}
                            >
                              قبل | {c.beforeFocalPoint || "50% 48%"}
                            </span>
                          </div>

                          <div className="admin-field">
                            <label className="admin-label">
                              رفع صورة «قبل» من جهازك
                            </label>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="admin-input"
                              onChange={(e) =>
                                handleCaseImageUpload(
                                  idx,
                                  "before",
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                          </div>

                          <div className="admin-field">
                            <label className="admin-label">
                              أو اختيار من مكتبة الوسائط
                            </label>
                            <select
                              className="admin-select"
                              value={c.beforeImageSrc}
                              onChange={(e) =>
                                updateDraft((d) => {
                                  if (d.resultsSection?.cases?.[idx]) {
                                    d.resultsSection.cases[idx].beforeImageSrc =
                                      e.target.value;
                                  }
                                  return d;
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
                            <label className="admin-label">
                              نقطة التركيز لصورة قبل (Focal Point)
                            </label>
                            <input
                              dir="ltr"
                              className="admin-input"
                              value={c.beforeFocalPoint || "50% 48%"}
                              onChange={(e) =>
                                updateDraft((d) => {
                                  if (d.resultsSection?.cases?.[idx]) {
                                    d.resultsSection.cases[
                                      idx
                                    ].beforeFocalPoint = e.target.value;
                                  }
                                  return d;
                                })
                              }
                            />
                          </div>

                          <div className="admin-field">
                            <label className="admin-label">
                              النص البديل لصورة قبل (عربي)
                            </label>
                            <input
                              className="admin-input"
                              value={c.beforeAltAr || ""}
                              onChange={(e) =>
                                updateDraft((d) => {
                                  if (d.resultsSection?.cases?.[idx]) {
                                    d.resultsSection.cases[idx].beforeAltAr =
                                      e.target.value;
                                  }
                                  return d;
                                })
                              }
                            />
                          </div>

                          <div className="admin-field">
                            <label className="admin-label">
                              Before Image Alt Text (English)
                            </label>
                            <input
                              dir="ltr"
                              className="admin-input"
                              value={c.beforeAltEn || ""}
                              onChange={(e) =>
                                updateDraft((d) => {
                                  if (d.resultsSection?.cases?.[idx]) {
                                    d.resultsSection.cases[idx].beforeAltEn =
                                      e.target.value;
                                  }
                                  return d;
                                })
                              }
                            />
                          </div>
                        </div>

                        {/* AFTER IMAGE PANEL */}
                        <div
                          className="admin-card"
                          style={{ padding: "0.95rem", gap: "0.65rem" }}
                        >
                          <strong style={{ fontSize: "0.95rem" }}>
                            ٢. صورة «بعد» (After Image)
                          </strong>

                          <div
                            style={{
                              position: "relative",
                              aspectRatio: "16 / 10",
                              borderRadius: "10px",
                              overflow: "hidden",
                              background: "#2E1426",
                              cursor: "crosshair",
                            }}
                            title="انقر على الصورة لضبط نقطة التركيز (Focal Point)"
                            onClick={(e) => {
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const x = Math.round(
                                ((e.clientX - rect.left) / rect.width) * 100
                              );
                              const y = Math.round(
                                ((e.clientY - rect.top) / rect.height) * 100
                              );
                              updateDraft((d) => {
                                if (d.resultsSection?.cases?.[idx]) {
                                  d.resultsSection.cases[
                                    idx
                                  ].afterFocalPoint = `${x}% ${y}%`;
                                }
                                return d;
                              });
                            }}
                          >
                            <img
                              src={c.afterImageSrc}
                              alt={c.afterAltAr || "صورة بعد"}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition:
                                  c.afterFocalPoint || "50% 48%",
                              }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                bottom: "0.5rem",
                                right: "0.5rem",
                                background: "rgba(119, 115, 79, 0.92)",
                                color: "#FBF7F3",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                padding: "0.2rem 0.6rem",
                                borderRadius: "6px",
                              }}
                            >
                              بعد | {c.afterFocalPoint || "50% 48%"}
                            </span>
                          </div>

                          <div className="admin-field">
                            <label className="admin-label">
                              رفع صورة «بعد» من جهازك
                            </label>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="admin-input"
                              onChange={(e) =>
                                handleCaseImageUpload(
                                  idx,
                                  "after",
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                          </div>

                          <div className="admin-field">
                            <label className="admin-label">
                              أو اختيار من مكتبة الوسائط
                            </label>
                            <select
                              className="admin-select"
                              value={c.afterImageSrc}
                              onChange={(e) =>
                                updateDraft((d) => {
                                  if (d.resultsSection?.cases?.[idx]) {
                                    d.resultsSection.cases[idx].afterImageSrc =
                                      e.target.value;
                                  }
                                  return d;
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
                            <label className="admin-label">
                              نقطة التركيز لصورة بعد (Focal Point)
                            </label>
                            <input
                              dir="ltr"
                              className="admin-input"
                              value={c.afterFocalPoint || "50% 48%"}
                              onChange={(e) =>
                                updateDraft((d) => {
                                  if (d.resultsSection?.cases?.[idx]) {
                                    d.resultsSection.cases[
                                      idx
                                    ].afterFocalPoint = e.target.value;
                                  }
                                  return d;
                                })
                              }
                            />
                          </div>

                          <div className="admin-field">
                            <label className="admin-label">
                              النص البديل لصورة بعد (عربي)
                            </label>
                            <input
                              className="admin-input"
                              value={c.afterAltAr || ""}
                              onChange={(e) =>
                                updateDraft((d) => {
                                  if (d.resultsSection?.cases?.[idx]) {
                                    d.resultsSection.cases[idx].afterAltAr =
                                      e.target.value;
                                  }
                                  return d;
                                })
                              }
                            />
                          </div>

                          <div className="admin-field">
                            <label className="admin-label">
                              After Image Alt Text (English)
                            </label>
                            <input
                              dir="ltr"
                              className="admin-input"
                              value={c.afterAltEn || ""}
                              onChange={(e) =>
                                updateDraft((d) => {
                                  if (d.resultsSection?.cases?.[idx]) {
                                    d.resultsSection.cases[idx].afterAltEn =
                                      e.target.value;
                                  }
                                  return d;
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* STATUS, ORDER & CONSENT GATE */}
                      <div className="admin-form-grid admin-form-grid--2">
                        <div className="admin-field">
                          <label className="admin-label">
                            حالة النشر (مسودة أو منشور)
                          </label>
                          <select
                            className="admin-select"
                            value={
                              c.status === "published" || c.published
                                ? "published"
                                : "draft"
                            }
                            onChange={(e) => {
                              const nextStatus = e.target.value as
                                | "draft"
                                | "published";
                              updateDraft((d) => {
                                if (d.resultsSection?.cases?.[idx]) {
                                  d.resultsSection.cases[idx].status =
                                    nextStatus;
                                  d.resultsSection.cases[idx].published =
                                    nextStatus === "published";
                                }
                                return d;
                              });
                            }}
                          >
                            <option value="draft">مسودة (Draft)</option>
                            <option value="published">منشور (Published)</option>
                          </select>
                        </div>

                        <div className="admin-field">
                          <label className="admin-label">
                            ترتيب العرض (Sort Order)
                          </label>
                          <input
                            type="number"
                            min={1}
                            dir="ltr"
                            className="admin-input"
                            value={c.sortOrder ?? idx + 1}
                            onChange={(e) =>
                              updateDraft((d) => {
                                if (d.resultsSection?.cases?.[idx]) {
                                  d.resultsSection.cases[idx].sortOrder =
                                    Number(e.target.value) || idx + 1;
                                }
                                return d;
                              })
                            }
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "1.25rem",
                          paddingTop: "0.35rem",
                        }}
                      >
                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(c.consentConfirmed)}
                            onChange={(e) =>
                              updateDraft((d) => {
                                if (d.resultsSection?.cases?.[idx]) {
                                  d.resultsSection.cases[
                                    idx
                                  ].consentConfirmed = e.target.checked;
                                }
                                return d;
                              })
                            }
                          />
                          <span>
                            إقرار بوجود موافقة خطية صريحة من المريض لنشر الصور
                          </span>
                        </label>

                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(c.approvedByDoctor)}
                            onChange={(e) =>
                              updateDraft((d) => {
                                if (d.resultsSection?.cases?.[idx]) {
                                  d.resultsSection.cases[
                                    idx
                                  ].approvedByDoctor = e.target.checked;
                                }
                                return d;
                              })
                            }
                          />
                          <span>اعتماد د. ريهام القحطاني الطبي للنشر</span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {activeTab === "specialtySection" ? (
            <section className="admin-card">
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                تحرير قسم «التخصص الدقيق»
              </h2>

              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">العنوان الفرعي</label>
                  <input
                    className="admin-input"
                    value={draft.specialtySection.eyebrow}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.specialtySection.eyebrow = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">العنوان الرئيسي</label>
                  <input
                    className="admin-input"
                    value={draft.specialtySection.title}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.specialtySection.title = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label">الوصف الرئيسي</label>
                <textarea
                  className="admin-textarea"
                  value={draft.specialtySection.lead}
                  onChange={(e) =>
                    updateDraft((d) => {
                      d.specialtySection.lead = e.target.value;
                      return d;
                    })
                  }
                />
              </div>

              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">صورة القسم</label>
                  <select
                    className="admin-select"
                    value={draft.specialtySection.image.src}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.specialtySection.image.src = e.target.value;
                        return d;
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
                  <label className="admin-label">النص البديل للصورة</label>
                  <input
                    className="admin-input"
                    value={draft.specialtySection.image.alt}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.specialtySection.image.alt = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>

              {draft.specialtySection.highlights.map((hl, idx) => (
                <div
                  key={idx}
                  className="admin-card admin-card--tinted"
                  style={{ padding: "1rem" }}
                >
                  <div className="admin-field">
                    <label className="admin-label">
                      عنوان النقطة ({hl.number})
                    </label>
                    <input
                      className="admin-input"
                      value={hl.title}
                      onChange={(e) =>
                        updateDraft((d) => {
                          d.specialtySection.highlights[idx].title =
                            e.target.value;
                          return d;
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">وصف النقطة</label>
                    <textarea
                      className="admin-textarea"
                      value={hl.description}
                      onChange={(e) =>
                        updateDraft((d) => {
                          d.specialtySection.highlights[idx].description =
                            e.target.value;
                          return d;
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          {activeTab === "beforeConsultationSection" ? (
            <section className="admin-card">
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                تحرير قسم «ما قبل الاستشارة»
              </h2>

              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">العنوان الفرعي</label>
                  <input
                    className="admin-input"
                    value={draft.beforeConsultationSection.eyebrow}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.beforeConsultationSection.eyebrow = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">عنوان القسم</label>
                  <input
                    className="admin-input"
                    value={draft.beforeConsultationSection.title}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.beforeConsultationSection.title = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label">الوصف التمهيدي</label>
                <textarea
                  className="admin-textarea"
                  value={draft.beforeConsultationSection.intro}
                  onChange={(e) =>
                    updateDraft((d) => {
                      d.beforeConsultationSection.intro = e.target.value;
                      return d;
                    })
                  }
                />
              </div>

              {draft.beforeConsultationSection.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="admin-card admin-card--tinted"
                  style={{ padding: "1rem" }}
                >
                  <div className="admin-field">
                    <label className="admin-label">
                      عنوان الخطوة ({step.stepNumber})
                    </label>
                    <input
                      className="admin-input"
                      value={step.title}
                      onChange={(e) =>
                        updateDraft((d) => {
                          d.beforeConsultationSection.steps[idx].title =
                            e.target.value;
                          return d;
                        })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">وصف الخطوة</label>
                    <textarea
                      className="admin-textarea"
                      value={step.description}
                      onChange={(e) =>
                        updateDraft((d) => {
                          d.beforeConsultationSection.steps[idx].description =
                            e.target.value;
                          return d;
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          {activeTab === "knowledgeSection" ? (
            <section className="admin-card">
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                تحرير قسم المقالات في الصفحة الرئيسية
              </h2>

              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">العنوان الفرعي</label>
                  <input
                    className="admin-input"
                    value={draft.knowledgeSection.eyebrow}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.knowledgeSection.eyebrow = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">عنوان القسم</label>
                  <input
                    className="admin-input"
                    value={draft.knowledgeSection.title}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.knowledgeSection.title = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label">وصف القسم</label>
                <textarea
                  className="admin-textarea"
                  value={draft.knowledgeSection.intro}
                  onChange={(e) =>
                    updateDraft((d) => {
                      d.knowledgeSection.intro = e.target.value;
                      return d;
                    })
                  }
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">نص زر تصفح كل المقالات</label>
                <input
                  className="admin-input"
                  value={draft.knowledgeSection.viewAllLabel}
                  onChange={(e) =>
                    updateDraft((d) => {
                      d.knowledgeSection.viewAllLabel = e.target.value;
                      return d;
                    })
                  }
                />
              </div>
            </section>
          ) : null}

          {activeTab === "contentStyleSection" ? (
            <section className="admin-card">
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                تحرير قسم «أسلوب المحتوى التوعوي»
              </h2>
              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">العنوان الفرعي</label>
                  <input
                    className="admin-input"
                    value={draft.contentStyleSection.eyebrow}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.contentStyleSection.eyebrow = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">عنوان القسم</label>
                  <input
                    className="admin-input"
                    value={draft.contentStyleSection.title}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.contentStyleSection.title = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label">النص</label>
                <textarea
                  className="admin-textarea"
                  value={draft.contentStyleSection.lead}
                  onChange={(e) =>
                    updateDraft((d) => {
                      d.contentStyleSection.lead = e.target.value;
                      return d;
                    })
                  }
                />
              </div>
            </section>
          ) : null}

          {activeTab === "faqSection" ? (
            <section className="admin-card">
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                تحرير عنوان قسم «الأسئلة الشائعة» في الرئيسية
              </h2>
              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">العنوان الفرعي</label>
                  <input
                    className="admin-input"
                    value={draft.faqSection.eyebrow}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.faqSection.eyebrow = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">العنوان الرئيسي</label>
                  <input
                    className="admin-input"
                    value={draft.faqSection.title}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.faqSection.title = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>
              <div className="admin-field">
                <label className="admin-label">الوصف</label>
                <textarea
                  className="admin-textarea"
                  value={draft.faqSection.intro}
                  onChange={(e) =>
                    updateDraft((d) => {
                      d.faqSection.intro = e.target.value;
                      return d;
                    })
                  }
                />
              </div>
            </section>
          ) : null}

          {activeTab === "finalInquiry" ? (
            <section className="admin-card">
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                تحرير قسم التواصل النهائي
              </h2>
              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">العنوان الفرعي</label>
                  <input
                    className="admin-input"
                    value={draft.finalInquiry.eyebrow}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.finalInquiry.eyebrow = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">العنوان الرئيسي</label>
                  <input
                    className="admin-input"
                    value={draft.finalInquiry.heading}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.finalInquiry.heading = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>
              <div className="admin-field">
                <label className="admin-label">الوصف الداعم</label>
                <textarea
                  className="admin-textarea"
                  value={draft.finalInquiry.support}
                  onChange={(e) =>
                    updateDraft((d) => {
                      d.finalInquiry.support = e.target.value;
                      return d;
                    })
                  }
                />
              </div>
              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">نص الزر الأساسي</label>
                  <input
                    className="admin-input"
                    value={draft.finalInquiry.primaryCta}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.finalInquiry.primaryCta = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">رابط الزر الأساسي</label>
                  <input
                    dir="ltr"
                    className="admin-input"
                    value={draft.finalInquiry.primaryHref}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.finalInquiry.primaryHref = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "headerFooter" ? (
            <section className="admin-card">
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                تحرير عناصر الهيدر والفوتر
              </h2>
              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">رابط: عن الدكتورة</label>
                  <input
                    className="admin-input"
                    value={draft.headerFooter.aboutLabel}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.headerFooter.aboutLabel = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">رابط: التخصص</label>
                  <input
                    className="admin-input"
                    value={draft.headerFooter.specialtyLabel}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.headerFooter.specialtyLabel = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">رابط: المعرفة الطبية</label>
                  <input
                    className="admin-input"
                    value={draft.headerFooter.journalLabel}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.headerFooter.journalLabel = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">رابط: التواصل والمواعيد</label>
                  <input
                    className="admin-input"
                    value={draft.headerFooter.contactLabel}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.headerFooter.contactLabel = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">نص زر الهيدر الأساسي</label>
                  <input
                    className="admin-input"
                    value={draft.headerFooter.primaryInquiryCta}
                    onChange={(e) =>
                      updateDraft((d) => {
                        d.headerFooter.primaryInquiryCta = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label">تنويه الفوتر الطبي</label>
                <textarea
                  className="admin-textarea"
                  value={draft.headerFooter.footerDisclaimer}
                  onChange={(e) =>
                    updateDraft((d) => {
                      d.headerFooter.footerDisclaimer = e.target.value;
                      return d;
                    })
                  }
                />
              </div>
            </section>
          ) : null}

          {activeTab === "englishContent" && draft.en ? (
            <section className="admin-card" dir="ltr" style={{ textAlign: "left" }}>
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                Edit English Homepage Copy (/en)
              </h2>

              <h3 style={{ fontSize: "1.05rem", margin: 0 }}>
                1. Hero Section (EN)
              </h3>
              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">Specialty Eyebrow</label>
                  <input
                    className="admin-input"
                    value={draft.en.hero.specialtyTag}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.en) d.en.hero.specialtyTag = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Main Title (Doctor Name)</label>
                  <input
                    className="admin-input"
                    value={draft.en.hero.headlineLine1}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.en) d.en.hero.headlineLine1 = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Italic Subtitle</label>
                  <input
                    className="admin-input"
                    value={draft.en.hero.headlineLine2}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.en) d.en.hero.headlineLine2 = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Primary CTA Button</label>
                  <input
                    className="admin-input"
                    value={draft.en.hero.primaryCta}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.en) d.en.hero.primaryCta = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>
              <div className="admin-field">
                <label className="admin-label">Hero Support Paragraph</label>
                <textarea
                  className="admin-textarea"
                  value={draft.en.hero.support}
                  onChange={(e) =>
                    updateDraft((d) => {
                      if (d.en) d.en.hero.support = e.target.value;
                      return d;
                    })
                  }
                />
              </div>

              <h3 style={{ fontSize: "1.05rem", margin: 0 }}>
                2. About Section (EN)
              </h3>
              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">Eyebrow</label>
                  <input
                    className="admin-input"
                    value={draft.en.doctorIntro.eyebrow}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.en) d.en.doctorIntro.eyebrow = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Section Heading</label>
                  <input
                    className="admin-input"
                    value={draft.en.doctorIntro.specialty}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.en) d.en.doctorIntro.specialty = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>
              <div className="admin-field">
                <label className="admin-label">About Narrative</label>
                <textarea
                  className="admin-textarea"
                  value={draft.en.doctorIntro.leadStatement}
                  onChange={(e) =>
                    updateDraft((d) => {
                      if (d.en)
                        d.en.doctorIntro.leadStatement = e.target.value;
                      return d;
                    })
                  }
                />
              </div>

              <h3 style={{ fontSize: "1.05rem", margin: 0 }}>
                3. Patient Education Section (EN)
              </h3>
              <div className="admin-form-grid admin-form-grid--2">
                <div className="admin-field">
                  <label className="admin-label">Eyebrow</label>
                  <input
                    className="admin-input"
                    value={draft.en.knowledgeSection.eyebrow}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.en)
                          d.en.knowledgeSection.eyebrow = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Heading</label>
                  <input
                    className="admin-input"
                    value={draft.en.knowledgeSection.title}
                    onChange={(e) =>
                      updateDraft((d) => {
                        if (d.en) d.en.knowledgeSection.title = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              </div>
              <div className="admin-field">
                <label className="admin-label">Intro</label>
                <textarea
                  className="admin-textarea"
                  value={draft.en.knowledgeSection.intro}
                  onChange={(e) =>
                    updateDraft((d) => {
                      if (d.en) d.en.knowledgeSection.intro = e.target.value;
                      return d;
                    })
                  }
                />
              </div>
            </section>
          ) : null}

          {activeTab === "order" ? (
            <section className="admin-card">
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                إظهار أو إخفاء الأقسام وإعادة ترتيبها
              </h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>الترتيب</th>
                      <th>القسم</th>
                      <th>الحالة</th>
                      <th>تحريك</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.sectionOrder.map((key, idx) => {
                      const enabled = draft.sectionVisibility[key] !== false;
                      return (
                        <tr key={key}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 700 }}>
                            {SECTION_LABELS[key] || key}
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`admin-btn ${
                                enabled ? "admin-btn--primary" : ""
                              }`}
                              onClick={() => toggleSectionEnabled(key)}
                            >
                              {enabled ? "ظاهر في الصفحة" : "مخفي"}
                            </button>
                          </td>
                          <td>
                            <div className="admin-btn-group">
                              <button
                                type="button"
                                className="admin-btn"
                                disabled={idx === 0}
                                onClick={() => moveSection(idx, -1)}
                              >
                                ↑ لأعلى
                              </button>
                              <button
                                type="button"
                                className="admin-btn"
                                disabled={idx === draft.sectionOrder.length - 1}
                                onClick={() => moveSection(idx, 1)}
                              >
                                ↓ لأسفل
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeTab === "revisions" ? (
            <section className="admin-card">
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                سجل النسخ السابقة واسترجاعها
              </h2>
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
                        <td style={{ fontWeight: 600 }}>{rev.summary}</td>
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
                          ) : (
                            <span>للمدير فقط</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      )}
    </AdminShell>
  );
}
