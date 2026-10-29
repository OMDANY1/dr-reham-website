import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "لوحة الإدارة | د. ريهام القحطاني",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
