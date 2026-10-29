"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import type { CmsFaqItem } from "@/lib/cms/types";

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<CmsFaqItem[]>([]);
  const [editing, setEditing] = useState<Partial<CmsFaqItem> | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "editor">("editor");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadFaqs = async () => {
    const [authRes, faqRes] = await Promise.all([
      fetch("/api/admin/auth", { cache: "no-store" }),
      fetch("/api/admin/faq", { cache: "no-store" }),
    ]);
    const authData = await authRes.json();
    if (authData.user?.role) setUserRole(authData.user.role);

    const faqData = await faqRes.json();
    if (faqData.faqs) setFaqs(faqData.faqs);
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setError("");
    setMessage("");

    const res = await fetch("/api/admin/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر حفظ السؤال.");
      return;
    }
    setMessage(data.message || "تم حفظ السؤال الشائع بنجاح.");
    setEditing(null);
    await loadFaqs();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل تريد حذف هذا السؤال الشائع؟")) return;
    const res = await fetch(`/api/admin/faq?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر حذف السؤال.");
      return;
    }
    setMessage(data.message || "تم حذف السؤال.");
    await loadFaqs();
  };

  return (
    <AdminShell
      title="إدارة الأسئلة الشائعة (FAQ)"
      subtitle="إضافة وتعديل وترتيب وإظهار أو إخفاء ونشر الأسئلة الشائعة"
      actions={
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={() =>
            setEditing({
              question: "",
              answer: "",
              category: "consultation",
              sortOrder: faqs.length + 1,
              status: "draft",
            })
          }
        >
          + سؤال جديد
        </button>
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

      {editing ? (
        <section className="admin-card">
          <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
            {editing.id ? "تعديل السؤال الشائع" : "إضافة سؤال شائع جديد"}
          </h2>

          <form onSubmit={handleSave} className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-label">السؤال</label>
              <input
                required
                className="admin-input"
                value={editing.question || ""}
                onChange={(e) =>
                  setEditing({ ...editing, question: e.target.value })
                }
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">الإجابة التوعوية</label>
              <textarea
                required
                className="admin-textarea"
                value={editing.answer || ""}
                onChange={(e) =>
                  setEditing({ ...editing, answer: e.target.value })
                }
              />
            </div>

            <div className="admin-form-grid admin-form-grid--2">
              <div className="admin-field">
                <label className="admin-label">التصنيف</label>
                <select
                  className="admin-select"
                  value={editing.category || "consultation"}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      category: e.target.value as CmsFaqItem["category"],
                    })
                  }
                >
                  <option value="consultation">الاستشارة والتقييم</option>
                  <option value="procedure">الإجراءات والتوقعات</option>
                  <option value="recovery">ما بعد الإجراء والتعافي</option>
                </select>
              </div>

              <div className="admin-field">
                <label className="admin-label">ترتيب الظهور</label>
                <input
                  type="number"
                  className="admin-input"
                  value={editing.sortOrder ?? 1}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      sortOrder: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {userRole === "admin" ? (
              <div className="admin-field">
                <label className="admin-label">حالة الظهور والنشر</label>
                <select
                  className="admin-select"
                  value={editing.status || "draft"}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      status: e.target.value as CmsFaqItem["status"],
                    })
                  }
                >
                  <option value="draft">مسودة (مخفي عن الزوار)</option>
                  <option value="published">منشور للجمهور</option>
                </select>
              </div>
            ) : null}

            <div className="admin-btn-group">
              <button type="submit" className="admin-btn admin-btn--primary">
                حفظ السؤال
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={() => setEditing(null)}
              >
                إلغاء
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الترتيب</th>
                <th>السؤال</th>
                <th>التصنيف</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((f) => (
                <tr key={f.id}>
                  <td>{f.sortOrder}</td>
                  <td style={{ fontWeight: 700 }}>{f.question}</td>
                  <td>{f.category}</td>
                  <td>
                    <span
                      className={`admin-badge ${
                        f.status === "published"
                          ? "admin-badge--published"
                          : "admin-badge--draft"
                      }`}
                    >
                      {f.status === "published" ? "منشور" : "مسودة / مخفي"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-btn-group">
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => setEditing(structuredClone(f))}
                      >
                        تعديل
                      </button>
                      {userRole === "admin" ? (
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => handleDelete(f.id)}
                        >
                          حذف
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
