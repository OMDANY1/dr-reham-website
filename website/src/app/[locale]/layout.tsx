import React from "react";
import { notFound } from "next/navigation";
import { isSupportedLocale } from "@/lib/content-gates";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <>{children}</>;
}
