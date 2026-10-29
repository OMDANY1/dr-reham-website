"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import type { CmsSiteSettings } from "@/lib/cms/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<CmsSiteSettings | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "editor">("editor");
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/auth", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/settings", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([authData, setData]) => {
      if (authData.user?.role) setUserRole(authData.user.role);
      setSupabaseConnected(Boolean(setData.supabaseConnected));
      if (setData.settings) setSettings(setData.settings);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          expectedVersion: settings.version,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر حفظ الإعدادات.");
        return;
      }
      setSettings(data.settings);
      setMessage(data.message || "تم حفظ إعدادات الموقع بنجاح.");
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="إعدادات الموقع العام وخصوصية البيانات"
      subtitle="إدارة هوية الموقع، الشعار، إعدادات محركات البحث SEO، ونص سياسة الخصوصية"
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

      <section className="admin-card admin-card--tinted">
        <h2 style={{ fontSize: "1.15rem", margin: 0 }}>
          حالة البنية الخلفية وقاعدة البيانات (Supabase + Server Persistence)
        </h2>
        <p style={{ fontSize: "var(--text-small)", margin: 0 }}>
          الحالة الحالية:{" "}
          <strong>
            {supabaseConnected
              ? "متصل بقاعدة بيانات وتخزين Supabase السحابي"
              : "يعمل بنظام التخزين الخادمي الدائم وجاهز للتحول التلقائي إلى Supabase فور إضافة متغيرات البيئة في Vercel"}
          </strong>
        </p>
        <div
          style={{
            fontSize: "var(--text-caption)",
            color: "var(--color-paragraph)",
          }}
        >
          لتفعيل الربط السحابي الكامل مع Supabase في إعدادات مشروع Vercel
          (Environment Variables)، أضف المتغيرات التالية ثم نفّذ ملف الهجرة{" "}
          <code dir="ltr">
            website/supabase/migrations/20261029000000_admin_cms_schema.sql
          </code>{" "}
          في SQL Editor داخل حساب Supabase الخاص بك:
          <ul
            dir="ltr"
            style={{
              marginBlockStart: "0.35rem",
              paddingInlineStart: "1.25rem",
            }}
          >
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li>SUPABASE_SERVICE_ROLE_KEY</li>
            <li>ADMIN_SESSION_SECRET</li>
          </ul>
        </div>
      </section>

      {!settings ? (
        <div className="admin-card">جاري تحميل الإعدادات...</div>
      ) : (
        <form onSubmit={handleSave} className="admin-card">
          <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
            الهوية العامة وإعدادات SEO
          </h2>

          <div className="admin-form-grid admin-form-grid--2">
            <div className="admin-field">
              <label className="admin-label" htmlFor="set-site-name">
                اسم الموقع الرسمي
              </label>
              <input
                id="set-site-name"
                className="admin-input"
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="set-specialty">
                المسمى المهني والتخصص
              </label>
              <input
                id="set-specialty"
                className="admin-input"
                value={settings.specialtyTitle}
                onChange={(e) =>
                  setSettings({ ...settings, specialtyTitle: e.target.value })
                }
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="set-logo">
                مسار الشعار (Logo)
              </label>
              <input
                id="set-logo"
                dir="ltr"
                className="admin-input"
                value={settings.logoPath}
                onChange={(e) =>
                  setSettings({ ...settings, logoPath: e.target.value })
                }
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="set-favicon">
                مسار أيقونة المتصفح (Favicon)
              </label>
              <input
                id="set-favicon"
                dir="ltr"
                className="admin-input"
                value={settings.faviconPath}
                onChange={(e) =>
                  setSettings({ ...settings, faviconPath: e.target.value })
                }
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="set-og-image">
                صورة المشاركة الافتراضية (Default OG Image)
              </label>
              <input
                id="set-og-image"
                dir="ltr"
                className="admin-input"
                value={settings.defaultOgImage}
                onChange={(e) =>
                  setSettings({ ...settings, defaultOgImage: e.target.value })
                }
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="set-seo-title">
                قالب عنوان SEO الافتراضي
              </label>
              <input
                id="set-seo-title"
                className="admin-input"
                value={settings.seoTitleTemplate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seoTitleTemplate: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="set-seo-desc">
              الوصف العام للموقع (Meta Description)
            </label>
            <textarea
              id="set-seo-desc"
              className="admin-textarea"
              value={settings.seoDefaultDescription}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  seoDefaultDescription: e.target.value,
                })
              }
            />
          </div>

          <h3 style={{ fontSize: "1.15rem", margin: 0 }}>
            نصوص صفحة الخصوصية وإخلاء المسؤولية
          </h3>

          <div className="admin-form-grid admin-form-grid--2">
            <div className="admin-field">
              <label className="admin-label">الجهة القانونية المشغلة</label>
              <input
                className="admin-input"
                value={settings.legalEntity || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    legalEntity: e.target.value || null,
                  })
                }
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">وسيلة التواصل للخصوصية</label>
              <input
                className="admin-input"
                value={settings.privacyContact || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    privacyContact: e.target.value || null,
                  })
                }
              />
            </div>
          </div>

          {settings.privacySections.map((sec, idx) => (
            <div
              key={sec.id || idx}
              className="admin-card admin-card--tinted"
              style={{ padding: "1rem" }}
            >
              <div className="admin-field">
                <label className="admin-label">عنوان البند {idx + 1}</label>
                <input
                  className="admin-input"
                  value={sec.heading}
                  onChange={(e) => {
                    const next = [...settings.privacySections];
                    next[idx] = { ...next[idx], heading: e.target.value };
                    setSettings({ ...settings, privacySections: next });
                  }}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">فقرات البند {idx + 1}</label>
                <textarea
                  className="admin-textarea"
                  value={sec.paragraphs.join("\n\n")}
                  onChange={(e) => {
                    const next = [...settings.privacySections];
                    next[idx] = {
                      ...next[idx],
                      paragraphs: e.target.value
                        .split(/\n\s*\n/)
                        .map((p) => p.trim())
                        .filter(Boolean),
                    };
                    setSettings({ ...settings, privacySections: next });
                  }}
                />
              </div>
            </div>
          ))}

          {userRole === "admin" ? (
            <div>
              <button
                type="submit"
                disabled={saving}
                className="admin-btn admin-btn--primary"
              >
                {saving ? "جاري الحفظ..." : "حفظ إعدادات الموقع"}
              </button>
            </div>
          ) : (
            <div className="admin-alert">
              تعديل الإعدادات العامة متاح لمدير النظام فقط.
            </div>
          )}
        </form>
      )}
    </AdminShell>
  );
}
