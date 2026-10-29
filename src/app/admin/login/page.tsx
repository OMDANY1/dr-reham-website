"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ViewMode = "login" | "bootstrap" | "reset_request" | "reset_confirm";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("login");
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [bootstrapToken, setBootstrapToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/admin/auth", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace("/admin");
          return;
        }
        if (data.needsBootstrap) {
          setNeedsBootstrap(true);
          setMode("bootstrap");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر تسجيل الدخول.");
        return;
      }
      router.replace("/admin");
    } catch {
      setError("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bootstrap",
          email,
          name,
          password,
          bootstrapToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر إنشاء حساب المدير الأول.");
        return;
      }
      router.replace("/admin");
    } catch {
      setError("حدث خطأ أثناء تهيئة الحساب.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_request",
          email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر إرسال طلب الاستعادة.");
        return;
      }
      setNotice(data.message || "تم إنشاء رمز الاستعادة.");
      if (data.devResetToken) {
        setResetToken(data.devResetToken);
      }
      setMode("reset_confirm");
    } catch {
      setError("حدث خطأ في الاتصال.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_confirm",
          token: resetToken,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "رمز الاستعادة غير صالح.");
        return;
      }
      setNotice("تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.");
      setMode("login");
      setPassword("");
    } catch {
      setError("حدث خطأ أثناء تعيين كلمة المرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minBlockSize: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-5)",
        backgroundColor: "var(--color-page-bg)",
      }}
      dir="rtl"
    >
      <div
        className="admin-card"
        style={{
          inlineSize: "100%",
          maxInlineSize: "30rem",
          borderTop: "4px solid var(--color-teal)",
        }}
      >
        <div>
          <span className="eyebrow">إدارة المحتوى الطبي</span>
          <h1
            style={{
              fontSize: "1.65rem",
              color: "var(--color-navy)",
              marginBlockEnd: "0.35rem",
            }}
          >
            {mode === "bootstrap"
              ? "تهيئة حساب المدير الأول"
              : mode === "reset_request"
              ? "استعادة كلمة المرور"
              : mode === "reset_confirm"
              ? "تعيين كلمة مرور جديدة"
              : "تسجيل الدخول إلى لوحة الإدارة"}
          </h1>
          <p
            style={{
              fontSize: "var(--text-small)",
              color: "var(--color-paragraph)",
            }}
          >
            موقع د. ريهام القحطاني — تجميل وترميم الجفون والمنطقة المحيطة بالعين
          </p>
        </div>

        {error ? (
          <div className="admin-alert admin-alert--error" role="alert">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="admin-alert" role="status">
            {notice}
          </div>
        ) : null}

        {mode === "bootstrap" ? (
          <form onSubmit={handleBootstrap} className="admin-form-grid">
            <div className="admin-alert">
              لا يوجد أي حساب مدير مسجل في قاعدة البيانات بعد. أنشئ حساب المدير
              الأول الآن بدون أي كلمات مرور افتراضية مخزنة في الكود.
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="bootstrap-name">
                الاسم الكامل (بالعربية)
              </label>
              <input
                id="bootstrap-name"
                type="text"
                required
                className="admin-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: د. ريهام القحطاني"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="bootstrap-email">
                البريد الإلكتروني المهني
              </label>
              <input
                id="bootstrap-email"
                type="email"
                required
                dir="ltr"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dr-reham.sa"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="bootstrap-password">
                كلمة المرور (10 أحرف على الأقل)
              </label>
              <input
                id="bootstrap-password"
                type="password"
                required
                minLength={10}
                dir="ltr"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="bootstrap-secret">
                رمز التهيئة الأولي (اختياري إلا إذا ضُبط ADMIN_BOOTSTRAP_TOKEN)
              </label>
              <input
                id="bootstrap-secret"
                type="password"
                dir="ltr"
                className="admin-input"
                value={bootstrapToken}
                onChange={(e) => setBootstrapToken(e.target.value)}
                placeholder="اتركه فارغاً ما لم يتم تعيين رمز بيئة"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-btn admin-btn--primary"
            >
              {loading ? "جاري الإنشاء..." : "إنشاء حساب المدير والدخول"}
            </button>

            {!needsBootstrap ? (
              <button
                type="button"
                className="admin-btn"
                onClick={() => setMode("login")}
              >
                العودة لتسجيل الدخول
              </button>
            ) : null}
          </form>
        ) : null}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-label" htmlFor="login-email">
                البريد الإلكتروني
              </label>
              <input
                id="login-email"
                type="email"
                required
                dir="ltr"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dr-reham.sa"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="login-password">
                كلمة المرور
              </label>
              <input
                id="login-password"
                type="password"
                required
                dir="ltr"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-btn admin-btn--primary"
            >
              {loading ? "جاري التحقق..." : "تسجيل الدخول"}
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBlockStart: "0.5rem",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setNotice("");
                  setMode("reset_request");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-teal)",
                  fontWeight: 700,
                  fontSize: "var(--text-small)",
                  cursor: "pointer",
                  fontFamily: "var(--font-ar)",
                }}
              >
                نسيت كلمة المرور؟
              </button>

              <Link
                href="/ar"
                style={{
                  color: "var(--color-secondary)",
                  fontSize: "var(--text-small)",
                  fontWeight: 600,
                }}
              >
                العودة للموقع العام
              </Link>
            </div>
          </form>
        ) : null}

        {mode === "reset_request" ? (
          <form onSubmit={handleResetRequest} className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-label" htmlFor="reset-email">
                البريد الإلكتروني المسجل
              </label>
              <input
                id="reset-email"
                type="email"
                required
                dir="ltr"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-btn admin-btn--primary"
            >
              {loading ? "جاري الإرسال..." : "إصدار رمز استعادة كلمة المرور"}
            </button>

            <button
              type="button"
              className="admin-btn"
              onClick={() => setMode("login")}
            >
              العودة لتسجيل الدخول
            </button>
          </form>
        ) : null}

        {mode === "reset_confirm" ? (
          <form onSubmit={handleResetConfirm} className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-label" htmlFor="reset-token">
                رمز الاستعادة المؤقت
              </label>
              <input
                id="reset-token"
                type="text"
                required
                dir="ltr"
                className="admin-input"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="reset-new-password">
                كلمة المرور الجديدة (10 أحرف على الأقل)
              </label>
              <input
                id="reset-new-password"
                type="password"
                required
                minLength={10}
                dir="ltr"
                className="admin-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-btn admin-btn--primary"
            >
              {loading ? "جاري الحفظ..." : "تأكيد كلمة المرور الجديدة"}
            </button>

            <button
              type="button"
              className="admin-btn"
              onClick={() => setMode("login")}
            >
              العودة لتسجيل الدخول
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
