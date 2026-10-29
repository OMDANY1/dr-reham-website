import type { ServiceRecord } from "@/lib/content-gates";

export const servicesPageCopy = {
  meta: {
    title: "الخدمات | د. ريهام القحطاني",
    description:
      "استشارات وخدمات طب وجراحة تجميل العيون والجفون مع د. ريهام القحطاني في الرياض.",
  },
  eyebrow: "التخصص السريري",
  headline: "الخدمات والاستشارات",
  intro:
    "يتم تحديد الخيارات العلاجية والتجميلية المناسبة لمنطقة الجفون ومحيط العين بناءً على الفحص المباشر خلال الاستشارة الطبية.",
  directVisitState: {
    title: "الاستفسار عن الخدمات والاستشارات",
    message:
      "لتقديم معلومات دقيقة تتناسب مع كل حالة، تتم مناقشة الإجراءات والخيارات المتاحة مباشرة مع الدكتورة خلال الاستشارة. يمكنك التواصل للاستفسار أو متابعة الحساب الرسمي.",
    primaryCta: "تواصل للاستفسار",
    secondaryCta: "عن الدكتورة",
  },
  detailLabels: {
    breadcrumbServices: "الخدمات",
    overviewHeading: "حول الخدمة وما تتضمنه",
    consultationHeading: "اعتبارات الاستشارة الطبية",
    preparationHeading: "التحضير قبل الإجراء",
    recoveryHeading: "المتابعة والتعافي",
    risksHeading: "المخاطر والآثار المحتملة",
    faqHeading: "أسئلة مرتبطة بالخدمة",
    relatedHeading: "خدمات ذات صلة",
    reviewedByPrefix: "إشراف ومراجعة:",
    reviewedAtPrefix: "تاريخ التحديث:",
  },
};

export const servicesRecords: ServiceRecord[] = [
  {
    slug: "eyelid-consultation-draft",
    title: "مسودة خدمة داخلية",
    summary: "سجل داخلي غير منشور.",
    category: "استشارة تخصصية",
    overview: null,
    consultationNotes: null,
    preparation: null,
    recovery: null,
    risks: null,
    faq: [],
    status: "draft",
    approvedBy: null,
    reviewedAt: null,
  },
];
