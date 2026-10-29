"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { CmsUser } from "@/lib/cms/types";

interface AdminShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  adminOnly?: boolean;
}> = [
  { href: "/admin", label: "الرئيسية والملخص" },
  { href: "/admin/pages", label: "أقسام الصفحات" },
  { href: "/admin/articles", label: "المقالات الطبية" },
  { href: "/admin/media", label: "مكتبة الوسائط والصور" },
  { href: "/admin/faq", label: "الأسئلة الشائعة" },
  { href: "/admin/locations", label: "العيادات والتواصل" },
  { href: "/admin/settings", label: "إعدادات الموقع والربط" },
  { href: "/admin/users", label: "المستخدمون والصلاحيات", adminOnly: true },
];

export function AdminShell({
  title,
  subtitle,
  actions,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CmsUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.replace("/admin/login");
          return;
        }
        setUser(data.user);
        setSupabaseConnected(Boolean(data.supabaseConnected));
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.replace("/admin/login");
  };

  const handleOpenPreview = async () => {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_preview", enable: true }),
    });
    window.open("/ar?preview=1", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="admin-layout" dir="rtl">
      {sidebarOpen ? (
        <div
          className="admin-sidebar__backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : ""}`.trim()}
        aria-label="قائمة لوحة الإدارة"
      >
        <div>
          <div className="admin-sidebar__brand">
            <span className="admin-sidebar__brand-title">
              لوحة إدارة د. ريهام القحطاني
            </span>
            <span className="admin-sidebar__brand-sub">
              إدارة المحتوى والوسائط والاعتماد الطبي
            </span>
          </div>

          <nav>
            <ul className="admin-nav">
              {NAV_ITEMS.filter((item) =>
                item.adminOnly ? user?.role === "admin" : true
              ).map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      pathname?.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`admin-nav__link ${
                        isActive ? "admin-nav__link--active" : ""
                      }`.trim()}
                    >
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="admin-sidebar__footer">
          {user ? (
            <div style={{ fontSize: "var(--text-caption)", lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, color: "var(--color-white)" }}>
                {user.name}
              </div>
              <div style={{ color: "rgba(255,255,255,0.78)" }}>{user.email}</div>
              <div style={{ marginBlockStart: "0.35rem" }}>
                <span className="admin-badge admin-badge--published">
                  {user.role === "admin" ? "مدير النظام" : "محرر محتوى"}
                </span>
              </div>
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
            }}
          >
            <button
              type="button"
              onClick={handleOpenPreview}
              className="admin-btn admin-btn--primary"
              style={{ width: "100%" }}
            >
              معاينة المسودات على الموقع
            </button>
            <Link
              href="/ar"
              target="_blank"
              className="admin-btn"
              style={{ width: "100%", textAlign: "center" }}
            >
              زيارة الموقع العام
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="admin-btn"
              style={{ width: "100%" }}
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              type="button"
              className="admin-topbar__menu-btn"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="فتح قائمة الإدارة"
            >
              ☰ القائمة
            </button>
            <div>
              <h1
                style={{
                  fontSize: "clamp(1.25rem, 1.8vw, 1.65rem)",
                  color: "var(--color-navy)",
                  margin: 0,
                }}
              >
                {title}
              </h1>
              {subtitle ? (
                <p
                  style={{
                    fontSize: "var(--text-caption)",
                    color: "var(--color-secondary)",
                    margin: 0,
                  }}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <div className="admin-btn-group">
            <span className="admin-badge">
              {supabaseConnected
                ? "قاعدة البيانات: Supabase متصلة"
                : "قاعدة البيانات: تخزين الخادم الدائم (جاهز لربط Supabase)"}
            </span>
            {actions}
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
