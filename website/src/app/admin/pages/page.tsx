"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import type {
  CmsMediaItem,
  CmsPageRecord,
  CmsRevision,
  HomePageCmsData,
  HomeSectionKey,
} from "@/lib/cms/types";

const SECTION_LABELS: Record<HomeSectionKey, string> = {
  doctorIntro: "قسم عن الدكتورة",
  specialtySection: "قسم التخصص الدقيق",
  beforeConsultationSection: "قسم ما قبل الاستشارة",
  knowledgeSection: "قسم المقالات في الرئيسية",
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
    | "doctorIntro"
    | "specialtySection"
    | "beforeConsultationSection"
    | "knowledgeSection"
    | "contentStyleSection"
    | "faqSection"
    | "finalInquiry"
    | "headerFooter"
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

  const handlePreview = async () => {
    if (dirty) {
      await handleSaveDraft();
    }
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_preview", enable: true }),
    });
    window.open("/ar?preview=1", "_blank", "noopener,noreferrer");
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

  return (
    <AdminShell
      title="تحرير أقسام الصفحات والهيدر والفوتر"
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
            onClick={handlePreview}
            disabled={saving || !draft}
            className="admin-btn admin-btn--navy"
          >
            معاينة قبل النشر
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
                { id: "doctorIntro", label: "٢. عن الدكتورة" },
                { id: "specialtySection", label: "٣. التخصص الدقيق" },
                { id: "beforeConsultationSection", label: "٤. ما قبل الاستشارة" },
                { id: "knowledgeSection", label: "٥. المقالات في الرئيسية" },
                { id: "contentStyleSection", label: "٦. أسلوب المحتوى التوعوي" },
                { id: "faqSection", label: "٧. قسم الأسئلة الشائعة" },
                { id: "finalInquiry", label: "٨. قسم التواصل النهائي" },
                { id: "headerFooter", label: "٩. الهيدر والفوتر" },
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
                    العبارة المميزة بالتيل (السطر الثاني)
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

          {activeTab === "doctorIntro" ? (
            <section className="admin-card">
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                تحرير قسم «عن الدكتورة»
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
                <label className="admin-label">الفقرة البارزة (#1E3A4C)</label>
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

              <div className="admin-form-grid admin-form-grid--2">
                {draft.doctorIntro.pillars.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="admin-card admin-card--tinted"
                    style={{ padding: "1rem" }}
                  >
                    <div className="admin-field">
                      <label className="admin-label">عنوان البطاقة {idx + 1}</label>
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
                      <label className="admin-label">نص البطاقة {idx + 1}</label>
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
