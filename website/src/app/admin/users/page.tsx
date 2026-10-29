"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import type { CmsRole, CmsUser } from "@/lib/cms/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<CmsRole>("editor");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "غير مصرح بالوصول لإدارة المستخدمين.");
      return;
    }
    if (data.users) setUsers(data.users);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        role,
        password,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر إنشاء المستخدم.");
      return;
    }
    setMessage(data.message || "تم إنشاء المستخدم بنجاح.");
    setEmail("");
    setName("");
    setPassword("");
    await loadUsers();
  };

  const handleToggleRole = async (user: CmsUser) => {
    setError("");
    setMessage("");
    const nextRole: CmsRole = user.role === "admin" ? "editor" : "admin";
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        role: nextRole,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر تحديث الدور.");
      return;
    }
    setMessage(data.message);
    await loadUsers();
  };

  const handleToggleActive = async (user: CmsUser) => {
    setError("");
    setMessage("");
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        active: !user.active,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "تعذر تحديث حالة الحساب.");
      return;
    }
    setMessage(data.message);
    await loadUsers();
  };

  return (
    <AdminShell
      title="إدارة المستخدمين والصلاحيات"
      subtitle="إنشاء حسابات المديرين والمحررين والتحكم في صلاحيات النشر والوصول"
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
          إضافة مستخدم جديد (مدير أو محرر)
        </h2>

        <form onSubmit={handleCreateUser} className="admin-form-grid">
          <div className="admin-form-grid admin-form-grid--2">
            <div className="admin-field">
              <label className="admin-label" htmlFor="new-user-name">
                الاسم الكامل
              </label>
              <input
                id="new-user-name"
                required
                className="admin-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسم المحرر أو المدير"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="new-user-email">
                البريد الإلكتروني
              </label>
              <input
                id="new-user-email"
                type="email"
                required
                dir="ltr"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@dr-reham.sa"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="new-user-role">
                الصلاحية
              </label>
              <select
                id="new-user-role"
                className="admin-select"
                value={role}
                onChange={(e) => setRole(e.target.value as CmsRole)}
              >
                <option value="editor">
                  محرر (كتابة وتعديل المسودات ورفع الصور والمعاينة فقط)
                </option>
                <option value="admin">
                  مدير (إدارة المحتوى والنشر والإعدادات والمستخدمين)
                </option>
              </select>
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="new-user-password">
                كلمة المرور (10 أحرف على الأقل)
              </label>
              <input
                id="new-user-password"
                type="password"
                required
                minLength={10}
                dir="ltr"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button type="submit" className="admin-btn admin-btn--primary">
              إنشاء الحساب
            </button>
          </div>
        </form>
      </section>

      <section className="admin-card">
        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
          المستخدمون المسجلون ({users.length})
        </h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الدور</th>
                <th>الحالة</th>
                <th>آخر دخول</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700 }}>{u.name}</td>
                  <td dir="ltr">{u.email}</td>
                  <td>
                    <span
                      className={`admin-badge ${
                        u.role === "admin"
                          ? "admin-badge--published"
                          : "admin-badge--draft"
                      }`}
                    >
                      {u.role === "admin" ? "مدير" : "محرر"}
                    </span>
                  </td>
                  <td>{u.active ? "نشط" : "معطل"}</td>
                  <td dir="ltr">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString("ar-SA")
                      : "—"}
                  </td>
                  <td>
                    <div className="admin-btn-group">
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => handleToggleRole(u)}
                      >
                        تغيير إلى {u.role === "admin" ? "محرر" : "مدير"}
                      </button>
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => handleToggleActive(u)}
                      >
                        {u.active ? "تعطيل الحساب" : "تفعيل الحساب"}
                      </button>
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
