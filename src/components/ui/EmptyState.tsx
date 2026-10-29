import React from "react";
import { Button } from "@/components/ui/Button";

export interface EmptyStateAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
  external?: boolean;
}

export interface EmptyStateProps {
  title?: string;
  message: string;
  actions?: EmptyStateAction[];
  note?: string;
  className?: string;
}

/**
 * مكوّن حالة الفراغ الصادقة (Honest Empty State)
 * يعرض للمستخدم حالة المحتوى قيد الاعتماد بوضوح وأناقة دون بيانات مختلقة.
 */
export function EmptyState({
  title,
  message,
  actions = [],
  note,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`.trim()} role="status">
      {title ? <h2 className="empty-state__title">{title}</h2> : null}
      <p className="empty-state__message">{message}</p>
      {note ? (
        <p style={{ fontSize: "var(--text-small)", color: "var(--muted)" }}>
          {note}
        </p>
      ) : null}
      {actions.length > 0 ? (
        <div className="empty-state__actions">
          {actions.map((action) => (
            <Button
              key={action.href + action.label}
              href={action.href}
              variant={action.variant ?? "secondary"}
              external={action.external}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
