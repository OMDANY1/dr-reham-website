"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import type { CmsClinicItem, CmsSiteSettings } from "@/lib/cms/types";

interface ContactSettingsState {
  instagramUrl: string;
  whatsappUrl: string | null;
  phone: string | null;
  email: string | null;
  defaultInquiryDestination: CmsSiteSettings["defaultInquiryDestination"];
  bookingEnabled: boolean;
  version: number;
}

export default function AdminLocationsPage() {
  const [clinics, setClinics] = useState<CmsClinicItem[]>([]);
  const [contact, setContact] = useState<ContactSettingsState | null>(null);
  const [editingClinic, setEditingClinic] =
    useState<Partial<CmsClinicItem> | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "editor">("editor");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    const [authRes, locRes] = await Promise.all([
      fetch("/api/admin/auth", { cache: "no-store" }),
      fetch("/api/admin/locations", { cache: "no-store" }),
    ]);
    const authData = await authRes.json();
    if (authData.user?.role) setUserRole(authData.user.role);

    const locData = await locRes.json();
    if (locData.clinics) setClinics(locData.clinics);
    if (locData.contactSettings) setContact(locData.contactSettings);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClinic) return;
    setError("");
    setMessage("");
    const res = await fetch("/api/admin/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingClinic),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر حفظ بيانات العيادة.");
      return;
    }
    setMessage(data.message || "تم حفظ العيادة بنجاح.");
    setEditingClinic(null);
    await loadData();
  };

  const handleDeleteClinic = async (id: string) => {
    if (!window.confirm("هل تريد حذف موقع العيادة هذا؟")) return;
    const res = await fetch(
      `/api/admin/locations?id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر حذف العيادة.");
      return;
    }
    setMessage(data.message);
    await loadData();
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;
    setError("");
    setMessage("");
    const res = await fetch("/api/admin/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_contact",
        ...contact,
        expectedVersion: contact.version,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر حفظ روابط التواصل.");
      return;
    }
    setMessage(data.message || "تم تحديث قنوات التواصل بنجاح.");
    await loadData();
  };

  return (
    <AdminShell
      title="إدارة مواقع العيادات وقنوات التواصل"
      subtitle="إدارة العيادات المعتمدة، روابط الخرائط والحجز، وقنوات التواصل الرسمية"
      actions={
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={() =>
            setEditingClinic({
              name: "",
              address: "",
              hours: "",
              mapsUrl: "",
              bookingUrl: "",
              phone: "",
              affiliationVerified: true,
              enabled: true,
              sortOrder: clinics.length + 1,
            })
          }
        >
          + إضافة موقع عيادة
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

      {editingClinic ? (
        <section className="admin-card">
          <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
            {editingClinic.id ? "تعديل موقع العيادة" : "إضافة موقع عيادة جديد"}
          </h2>

          <form onSubmit={handleSaveClinic} className="admin-form-grid">
            <div className="admin-form-grid admin-form-grid--2">
              <div className="admin-field">
                <label className="admin-label">اسم الجهة الطبية / المستشفى</label>
                <input
                  required
                  className="admin-input"
                  value={editingClinic.name || ""}
                  onChange={(e) =>
                    setEditingClinic({
                      ...editingClinic,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">
                  العنوان التفصيلي (يُخفى تلقائياً إن تُرك فارغاً)
                </label>
                <input
                  className="admin-input"
                  value={editingClinic.address || ""}
                  onChange={(e) =>
                    setEditingClinic({
                      ...editingClinic,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">
                  أوقات العمل النصية (تُخفى إن تُركت فارغة)
                </label>
                <input
                  className="admin-input"
                  value={editingClinic.hours || ""}
                  onChange={(e) =>
                    setEditingClinic({
                      ...editingClinic,
                      hours: e.target.value,
                    })
                  }
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">
                  رابط خرائط جوجل (HTTPS فقط)
                </label>
                <input
                  dir="ltr"
                  className="admin-input"
                  value={editingClinic.mapsUrl || ""}
                  onChange={(e) =>
                    setEditingClinic({
                      ...editingClinic,
                      mapsUrl: e.target.value,
                    })
                  }
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">
                  رابط الحجز المباشر للعيادة (HTTPS فقط)
                </label>
                <input
                  dir="ltr"
                  className="admin-input"
                  value={editingClinic.bookingUrl || ""}
                  onChange={(e) =>
                    setEditingClinic({
                      ...editingClinic,
                      bookingUrl: e.target.value,
                    })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">
                  رقم التواصل (اختياري — يُخفى إن تُرك فارغاً)
                </label>
                <input
                  dir="ltr"
                  className="admin-input"
                  value={editingClinic.phone || ""}
                  onChange={(e) =>
                    setEditingClinic({
                      ...editingClinic,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {userRole === "admin" ? (
              <div className="admin-btn-group">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: 700,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(editingClinic.enabled)}
                    onChange={(e) =>
                      setEditingClinic({
                        ...editingClinic,
                        enabled: e.target.checked,
                      })
                    }
                  />
                  <span>إظهار العيادة في الموقع العام</span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(editingClinic.affiliationVerified)}
                    onChange={(e) =>
                      setEditingClinic({
                        ...editingClinic,
                        affiliationVerified: e.target.checked,
                      })
                    }
                  />
                  <span>بيانات العيادة مؤكدة ومعتمدة للعرض</span>
                </label>
              </div>
            ) : null}

            <div className="admin-btn-group">
              <button type="submit" className="admin-btn admin-btn--primary">
                حفظ موقع العيادة
              </button>
              <button
                type="button"
                className="admin-btn"
                onClick={() => setEditingClinic(null)}
              >
                إلغاء
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="admin-card">
        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
          مواقع العيادات المسجلة ({clinics.length})
        </h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الجهة الطبية</th>
                <th>الهاتف</th>
                <th>رابط الحجز</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {clinics.map((clinic) => (
                <tr key={clinic.id}>
                  <td style={{ fontWeight: 700 }}>{clinic.name}</td>
                  <td dir="ltr">{clinic.phone || "—"}</td>
                  <td dir="ltr">{clinic.bookingUrl || "—"}</td>
                  <td>
                    <span
                      className={`admin-badge ${
                        clinic.enabled && clinic.affiliationVerified
                          ? "admin-badge--published"
                          : "admin-badge--draft"
                      }`}
                    >
                      {clinic.enabled && clinic.affiliationVerified
                        ? "ظاهر للجمهور"
                        : "مخفي"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-btn-group">
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() =>
                          setEditingClinic(structuredClone(clinic))
                        }
                      >
                        تعديل
                      </button>
                      {userRole === "admin" ? (
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => handleDeleteClinic(clinic.id)}
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

      {contact ? (
        <section className="admin-card">
          <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
            روابط التواصل والوجهة الافتراضية لزر الاستفسار
          </h2>

          <form onSubmit={handleSaveContact} className="admin-form-grid">
            <div className="admin-form-grid admin-form-grid--2">
              <div className="admin-field">
                <label className="admin-label">رابط حساب إنستجرام الرسمي</label>
                <input
                  dir="ltr"
                  className="admin-input"
                  value={contact.instagramUrl}
                  onChange={(e) =>
                    setContact({ ...contact, instagramUrl: e.target.value })
                  }
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">
                  رابط واتساب (اختياري — يُخفى إن تُرك فارغاً)
                </label>
                <input
                  dir="ltr"
                  className="admin-input"
                  value={contact.whatsappUrl || ""}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      whatsappUrl: e.target.value || null,
                    })
                  }
                  placeholder="https://wa.me/966..."
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">
                  رقم الهاتف الموحد (اختياري)
                </label>
                <input
                  dir="ltr"
                  className="admin-input"
                  value={contact.phone || ""}
                  onChange={(e) =>
                    setContact({ ...contact, phone: e.target.value || null })
                  }
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  dir="ltr"
                  className="admin-input"
                  value={contact.email || ""}
                  onChange={(e) =>
                    setContact({ ...contact, email: e.target.value || null })
                  }
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">
                  الوجهة الافتراضية لزر الاستفسار
                </label>
                <select
                  className="admin-select"
                  value={contact.defaultInquiryDestination}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      defaultInquiryDestination:
                        e.target.value as CmsSiteSettings["defaultInquiryDestination"],
                    })
                  }
                >
                  <option value="book_page">صفحة التواصل والمواعيد</option>
                  <option value="instagram">حساب إنستجرام الرسمي</option>
                  <option value="whatsapp">واتساب</option>
                  <option value="phone">الاتصال الهاتفي</option>
                  <option value="email">البريد الإلكتروني</option>
                </select>
              </div>
            </div>

            {userRole === "admin" ? (
              <div>
                <button type="submit" className="admin-btn admin-btn--primary">
                  حفظ قنوات التواصل
                </button>
              </div>
            ) : null}
          </form>
        </section>
      ) : null}
    </AdminShell>
  );
}
