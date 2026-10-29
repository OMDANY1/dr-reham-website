"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import type { CmsAuditLog } from "@/lib/cms/types";

interface DashboardOverview {
  supabaseConnected: boolean;
  counts: {
    publishedArticles: number;
    draftArticles: number;
    inReviewArticles: number;
    archivedArticles: number;
    mediaCount: number;
    publishedFaqs: number;
    homeHasUnpublishedDraft: boolean;
  };
  pendingReviewList: Array<{
    id: string;
    slug: string;
    title: string;
    category: string;
    updatedAt: string;
    updatedBy: string | null;
  }>;
  recentAuditLogs: CmsAuditLog[];
}

export default function AdminDashboardHomePage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/pages", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.overview) {
          setOverview(data.overview);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOpenPreview = async () => {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_preview", enable: true }),
    });
    window.open("/ar?preview=1", "_blank", "noopener,noreferrer");
  };

  return (
    <AdminShell
      title="لوحة التحكم الرئيسية"
      subtitle="متابعة فورية للمحتوى المنشور والمسودات وسجل المراجعة"
      actions={
        <div className="admin-btn-group">
          <Link
            href="/admin/articles?new=1"
            className="admin-btn admin-btn--primary"
          >
            + مقال جديد
          </Link>
          <Link href="/admin/media" className="admin-btn">
            رفع صورة
          </Link>
          <Link href="/admin/pages" className="admin-btn">
            تعديل الصفحة الرئيسية
          </Link>
          <button
            type="button"
            onClick={handleOpenPreview}
            className="admin-btn admin-btn--navy"
          >
            معاينة الموقع
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="admin-card">جاري تحميل إحصاءات قاعدة البيانات...</div>
      ) : overview ? (
        <>
          <div className="admin-stats-grid" aria-label="إحصاءات المحتوى الفعلية">
            <div className="admin-stat-box">
              <span className="admin-stat-box__value">
                {overview.counts.publishedArticles}
              </span>
              <span className="admin-stat-box__label">المقالات المنشورة</span>
            </div>

            <div className="admin-stat-box">
              <span className="admin-stat-box__value">
                {overview.counts.draftArticles}
              </span>
              <span className="admin-stat-box__label">المسودات قيد الإعداد</span>
            </div>

            <div className="admin-stat-box">
              <span className="admin-stat-box__value">
                {overview.counts.inReviewArticles}
              </span>
              <span className="admin-stat-box__label">
                مقالات تنتظر المراجعة والاعتماد
              </span>
            </div>

            <div className="admin-stat-box">
              <span className="admin-stat-box__value">
                {overview.counts.mediaCount}
              </span>
              <span className="admin-stat-box__label">الصور في مكتبة الوسائط</span>
            </div>

            <div className="admin-stat-box">
              <span className="admin-stat-box__value">
                {overview.counts.publishedFaqs}
              </span>
              <span className="admin-stat-box__label">
                الأسئلة الشائعة المنشورة
              </span>
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            <section className="admin-card">
              <div className="admin-toolbar">
                <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                  مقالات تنتظر المراجعة ({overview.pendingReviewList.length})
                </h2>
                <Link href="/admin/articles" className="admin-btn">
                  كل المقالات
                </Link>
              </div>

              {overview.pendingReviewList.length === 0 ? (
                <p
                  style={{
                    color: "var(--color-secondary)",
                    fontSize: "var(--text-small)",
                  }}
                >
                  لا توجد مقالات معلقة في قائمة المراجعة حالياً.
                </p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>العنوان</th>
                        <th>التصنيف</th>
                        <th>إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.pendingReviewList.map((art) => (
                        <tr key={art.id}>
                          <td style={{ fontWeight: 700 }}>{art.title}</td>
                          <td>{art.category}</td>
                          <td>
                            <Link
                              href={`/admin/articles?edit=${encodeURIComponent(art.slug)}`}
                              className="admin-btn"
                            >
                              مراجعة واعتماد
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-card">
              <div className="admin-toolbar">
                <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                  اختصارات الإدارة السريعة
                </h2>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))",
                  gap: "0.75rem",
                }}
              >
                <Link
                  href="/admin/articles?new=1"
                  className="admin-btn admin-btn--primary"
                >
                  مقال جديد
                </Link>
                <Link href="/admin/media" className="admin-btn">
                  رفع صورة جديدة
                </Link>
                <Link href="/admin/pages" className="admin-btn">
                  تعديل الصفحة الرئيسية
                </Link>
                <Link href="/admin/faq" className="admin-btn">
                  إدارة الأسئلة الشائعة
                </Link>
                <Link href="/admin/locations" className="admin-btn">
                  إدارة العيادات والتواصل
                </Link>
                <button
                  type="button"
                  onClick={handleOpenPreview}
                  className="admin-btn admin-btn--navy"
                >
                  معاينة الموقع بالمسودات
                </button>
              </div>
            </section>
          </div>

          <section className="admin-card">
            <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
              آخر تعديلات المحتوى ومن أجراها
            </h2>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>العملية</th>
                    <th>القسم</th>
                    <th>المنفذ</th>
                    <th>الصلاحية</th>
                    <th>التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recentAuditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 600 }}>{log.summary}</td>
                      <td>
                        <span className="admin-badge">{log.entityType}</span>
                      </td>
                      <td>{log.actorName}</td>
                      <td>
                        {log.actorRole === "admin" ? "مدير" : "محرر"}
                      </td>
                      <td dir="ltr" style={{ color: "var(--color-secondary)" }}>
                        {new Date(log.createdAt).toLocaleString("ar-SA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </AdminShell>
  );
}
