import type { FaqCategory, FaqRecord } from "@/lib/content-gates";

export const faqPageCopy = {
  meta: {
    title: "الأسئلة الشائعة | د. ريهام القحطاني",
    description:
      "أسئلة عملية مختصرة حول التواصل والاستعداد للاستشارة لدى د. ريهام القحطاني — طب وجراحة تجميل العيون والجفون في الرياض.",
  },
  eyebrow: "معلومات الزيارة والتواصل",
  headline: "أسئلة عملية مختصرة",
  intro:
    "إجابات واضحة وموجزة حول آلية التواصل والاستعداد العام للاستشارة.",
  categoryTitles: {
    appointments: "المواعيد والتواصل",
    consultation: "الاستعداد للاستشارة",
    procedure: "الإجراءات والعناية",
  } satisfies Record<FaqCategory, string>,
  directVisitState: {
    title: "هل لديك استفسار إضافي قبل زيارتك؟",
    message:
      "يمكنك التواصل مباشرة للاستفسار عن المواعيد والزيارات عبر القناة الرسمية المعتمدة للدكتورة ريهام القحطاني.",
    primaryCta: "تواصل للاستفسار",
    secondaryCta: "العودة للرئيسية",
  },
};

/**
 * أسئلة عملية وتنظيمية مختصرة مرتبطة بالتواصل والاستعداد العام للاستشارة،
 * متسقة مع المعلومات المؤكدة فقط دون ادعاءات علاجية أو أسماء عيادات غير مؤكدة.
 * أي سؤال يتضمن معلومة غير مؤكدة (مثل مكان العمل الحالي) يبقى بحالة draft ولا يُعرض.
 */
export const faqRecords: FaqRecord[] = [
  {
    id: "how-to-inquire-appointments",
    question: "كيف يمكنني التواصل للاستفسار عن المواعيد؟",
    answer:
      "يتم استقبال الاستفسارات حول المواعيد والزيارات في الرياض عبر الحساب الرسمي الموثق للدكتورة ريهام القحطاني على منصة إنستجرام (@dr.rehamdq)، مع مراعاة عدم إرسال تقارير أو صور طبية خاصة عبر الرسائل العامة.",
    category: "appointments",
    status: "published",
    reviewedBy: "إرشادات التواصل التنظيمية المعتمدة",
    isAdministrativeSeed: true,
  },
  {
    id: "what-to-prepare-before-consultation",
    question: "ما الذي يفيد تحضيره قبل حضور الاستشارة؟",
    answer:
      "يُنصح بتدوين الملاحظات والأسئلة التي ترغب في مناقشتها، وتجهيز قائمة بالقطرات أو الأدوية المستخدمة حاليًا، وإحضار أي فحوصات أو تقارير سابقة تخص العين أو الجفون إن توفرت.",
    category: "consultation",
    status: "published",
    reviewedBy: "إرشادات التواصل التنظيمية المعتمدة",
    isAdministrativeSeed: true,
  },
  {
    id: "can-case-be-assessed-by-messages",
    question: "هل يمكن تقييم الحالة أو تحديد الخيار المناسب عبر الرسائل؟",
    answer:
      "قنوات التواصل والمقالات المنشورة مخصصة للاستفسارات التنظيمية والتوعية العامة فقط؛ أما التقييم الطبي الدقيق ومناقشة الخيارات المناسبة فيتمان حصرًا بعد الفحص السريري المباشر خلال الاستشارة.",
    category: "consultation",
    status: "published",
    reviewedBy: "إرشادات التواصل التنظيمية المعتمدة",
    isAdministrativeSeed: true,
  },
  {
    id: "how-to-use-educational-articles",
    question: "كيف أستفيد من المقالات المنشورة في الموقع قبل زيارتي؟",
    answer:
      "صُممت المقالات لشرح المصطلحات الشائعة حول العين والجفون ومساعدتك على ترتيب أفكارك وأسئلتك قبل الموعد، وهي مواد تثقيفية عامة لا تحل محل المعاينة الطبية الشخصية.",
    category: "consultation",
    status: "published",
    reviewedBy: "إرشادات التواصل التنظيمية المعتمدة",
    isAdministrativeSeed: true,
  },
  {
    id: "where-does-doctor-practice",
    question: "أين تعمل الدكتورة؟",
    answer: null,
    category: "appointments",
    status: "draft",
    reviewedBy: null,
  },
];
