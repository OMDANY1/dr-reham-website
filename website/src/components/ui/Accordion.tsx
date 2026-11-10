import React from "react";
import { renderBidiSafeText } from "@/lib/bidi";

export interface AccordionItemData {
  id: string;
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export interface AccordionProps {
  items: AccordionItemData[];
  className?: string;
}

/**
 * أكورديون قياسي متوافق مع إمكانية الوصول ولوحة المفاتيح وبدون الحاجة إلى JavaScript.
 * يسمح بفتح عدة إجابات في آن واحد ويوفر منطقة لمس مريحة (≥ 48px) مع حركة فتح سلسة وعزل اتجاه الأرقام الدولية.
 */
export function Accordion({ items, className = "" }: AccordionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`accordion-list ${className}`.trim()}>
      {items.map((item, idx) => (
        <details
          key={item.id}
          id={`faq-${item.id}`}
          className="accordion-item stagger-item"
          style={{ "--stagger-index": idx } as React.CSSProperties}
          open={item.defaultOpen}
        >
          <summary className="accordion-summary">
            <span>{renderBidiSafeText(item.question)}</span>
            <span className="accordion-indicator" aria-hidden="true">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 5.25L7 9.25L11 5.25"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </summary>
          <div className="accordion-body">
            <div className="accordion-body__inner">
              <p>{renderBidiSafeText(item.answer)}</p>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
