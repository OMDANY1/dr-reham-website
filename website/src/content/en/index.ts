import { siteConfig } from "@/config/site";
import type { ArticleLocaleContent, FaqCategory } from "@/lib/content-gates";

export const ARTICLE_CATEGORIES_EN = [
  "All",
  "Eyelids & Orbit",
  "Periocular Care",
  "Consultation Prep",
] as const;

export const CATEGORY_AR_TO_EN: Record<string, string> = {
  "الكل": "All",
  "العين والجفون": "Eyelids & Orbit",
  "حول العين": "Periocular Care",
  "قبل الاستشارة": "Consultation Prep",
};

export const CATEGORY_EN_TO_AR: Record<string, string> = {
  All: "الكل",
  "Eyelids & Orbit": "العين والجفون",
  "Periocular Care": "حول العين",
  "Consultation Prep": "قبل الاستشارة",
};

export const homeContentEn = {
  meta: {
    title: "Dr. Reham Alqahtani | Oculoplastic & Eyelid Surgery",
    description:
      "Precision in Care, Harmony in Aesthetics — Dr. Reham Alqahtani, Oculoplastic & Eyelid Surgery in Riyadh.",
  },
  navigation: {
    home: "Home",
    about: "About",
    specialty: "Expertise",
    services: "Services",
    results: "Results",
    education: "Education",
    research: "Research",
    journal: "Articles",
    faq: "FAQ",
    contact: "Contact",
    privacy: "Privacy",
    backHome: "Back to Home",
    primaryInquiryCta: "Book a Consultation",
  },
  hero: {
    doctorTag: "Dr. Reham Alqahtani",
    specialtyTag: "OCULOPLASTIC & EYELID SURGERY",
    headlineLine1: "Dr. Reham",
    headlineLine2: "Alqahtani",
    tagline: "Precision in Care.\nHarmony in Aesthetics.",
    support:
      "Specialized medical and aesthetic care for the eyelids and periocular region in Riyadh.",
    primaryCta: "Book a Consultation",
    secondaryCta: "About Dr. Reham",
    secondaryHref: "/en/about",
    destinationHint: "Direct inquiry via official WhatsApp:",
    image: {
      src: "/media/hero-eye-plum-ivory.jpg",
      alt: "Editorial macro close-up of a natural human eye and eyebrow framed in warm ivory silk",
    },
  },
  specialtiesStrip: [
    {
      id: "eyelid-care",
      icon: "eye" as const,
      title: "Eyelid Surgery",
      subtitle: "Functional & Aesthetic",
    },
    {
      id: "periocular-harmony",
      icon: "spark" as const,
      title: "Periocular Care",
      subtitle: "Balanced Natural Contours",
    },
    {
      id: "tear-surface",
      icon: "droplet" as const,
      title: "Ocular Surface & Comfort",
      subtitle: "Protective Eye Physiology",
    },
    {
      id: "consultation-assessment",
      icon: "layers" as const,
      title: "Tailored Clinical Evaluation",
      subtitle: "Individualized Care Planning",
    },
  ],
  doctorIntro: {
    id: "about-doctor",
    eyebrow: "ABOUT",
    name: "Dr. Reham Alqahtani",
    heading: "A Focused Subspecialty in Eye & Eyelid Surgery",
    specialty: "Oculoplastic & Eyelid Surgery",
    city: "Riyadh",
    leadStatement:
      "Specialized medical practice dedicated to the eyelids and periocular region, balancing vital ocular function with calm, natural facial harmony.",
    sculptureImage: {
      src: "/media/dr-reham-about.jpg",
      alt: "Dr. Reham Alqahtani — Oculoplastic & Eyelid Surgery",
    },
    principles: [
      {
        icon: "cap" as const,
        title: "Surgical Expertise",
      },
      {
        icon: "gem" as const,
        title: "Evidence-Based Care",
      },
      {
        icon: "contour" as const,
        title: "Natural, Functional Results",
      },
      {
        icon: "shield" as const,
        title: "Patient-Centered Approach",
      },
    ],
    pillars: [
      {
        title: "Thoughtful Individual Evaluation",
        text: "Every consultation begins with a careful examination of eyelid anatomy and periocular balance, discussing realistic options with clarity.",
      },
      {
        title: "Function & Aesthetics in Balance",
        text: "Caring for the eyelids requires deep respect for ocular surface comfort, tear film stability, and natural facial expression.",
      },
    ],
    moreLinkLabel: "About Dr. Reham",
    moreLinkHref: "/en/about",
  },
  resultsSection: {
    id: "results",
    eyebrow: "Selected Cases",
    title: "Before & After",
    description:
      "Selected cases from Dr. Reham’s practice. Individual results vary.",
    ctaLabel: "Book a Consultation",
    beforeLabel: "Before",
    afterLabel: "After",
    previewNotice:
      "Structural Preview Only (Protected) — Automatically hidden on the public website until real consented patient cases are approved.",
  },
  specialtySection: {
    id: "specialty",
    eyebrow: "CLINICAL FOCUS",
    title: "Eyelid & Periocular Aesthetics and Function",
    lead: "Oculoplastic and eyelid care focuses on the most delicate region of the face, where subtle anatomical details shape both ocular comfort and the brightness of your gaze.",
    image: {
      src: "/media/article-brow-lid-harmony.jpg",
      alt: "Warm editorial close-up of the upper eyelid crease and eyebrow contour",
    },
    highlights: [
      {
        number: "01",
        title: "Upper & Lower Eyelid Contours",
        description:
          "Respecting the natural flow of the eyelid crease and its transition toward the brow and upper cheek without overcorrection.",
      },
      {
        number: "02",
        title: "Ocular Comfort & Vitality",
        description:
          "Evaluating the anatomical and environmental factors behind a tired periocular appearance while prioritizing eye health.",
      },
      {
        number: "03",
        title: "Decisions Guided by Direct Examination",
        description:
          "Every care plan is established after an in-person clinical evaluation and transparent discussion of expectations.",
      },
    ],
  },
  beforeConsultationSection: {
    id: "before-consultation",
    eyebrow: "PREPARATORY GUIDANCE",
    title: "Before Your Consultation",
    intro:
      "Simple preparatory steps to help you organize your notes and make the most of your clinical visit.",
    steps: [
      {
        stepNumber: "01",
        title: "Write Down Your Questions",
        description:
          "Note what you have observed around your eyelids or eyes, when it started, and the key questions you wish to discuss.",
      },
      {
        stepNumber: "02",
        title: "Bring Current Eye Drops & Records",
        description:
          "Prepare a list of any lubricating or prescription eye drops, current medications, and prior eye records if available.",
      },
      {
        stepNumber: "03",
        title: "Discuss Your Goals Openly",
        description:
          "Share your expectations clearly during the examination to understand the options best suited to your individual anatomy.",
      },
    ],
    generalNote:
      "These points are provided as general preparatory guidance; individualized recommendations are determined during your in-person consultation.",
  },
  servicesSection: {
    eyebrow: "CLINICAL SERVICES",
    title: "Approved Services",
    intro: "Details on specialized eyelid and periocular consultations.",
    viewAllLabel: "All Services",
  },
  knowledgeSection: {
    eyebrow: "PATIENT EDUCATION",
    title: "Learn & Stay Informed",
    intro:
      "Expert articles and practical guidance on common eye, eyelid and periocular topics.",
    viewAllLabel: "View All Articles",
    readArticleLabel: "Read Article",
  },
  contentStyleSection: {
    id: "content-style",
    eyebrow: "EDUCATIONAL APPROACH",
    title: "Calm, Evidence-Informed Guidance",
    lead: "Our educational materials aim to clarify eyelid and periocular terminology in accessible language, free from exaggerated claims or one-size-fits-all templates.",
    pillars: [
      {
        title: "Clarifying Anatomy & Terminology",
        text: "Explaining subtle distinctions in eyelid fold, brow position, and periocular structure in clear, reassuring language.",
      },
      {
        title: "Realistic Awareness Before Decisions",
        text: "Emphasizing the importance of direct clinical examination and balanced expectations that protect eye health.",
      },
    ],
    instagramCard: {
      badge: "Verified Official Account",
      handle: "@dr.rehamdq",
      title: "Educational Insights on Instagram",
      description:
        "Visit Dr. Reham Alqahtani's official Instagram profile for educational updates and direct appointment inquiries.",
      ctaLabel: "Visit Official Instagram",
      image: {
        src: "/media/article-eyelid-indication.jpg",
        alt: "Warm editorial image representing Dr. Reham Alqahtani's educational content",
      },
    },
  },
  testimonialsSection: {
    id: "follower-testimonials",
    eyebrow: "COMMUNITY IMPRESSIONS",
    title: "Follower Reflections",
    subtitle:
      "Reflections from followers and visitors on our educational approach and calm consultation experience.",
  },
  faqSection: {
    id: "practical-faq",
    eyebrow: "VISIT & INQUIRY INFO",
    title: "Practical Questions",
    intro:
      "Clear, concise answers regarding appointment inquiries and how to prepare for your consultation.",
    viewAllLabel: "View All Questions",
  },
  finalInquiry: {
    eyebrow: "DIRECT INQUIRY",
    heading: "Begin Your Consultation Inquiry",
    support:
      "For appointment inquiries and clinic visits in Riyadh, connect directly via Dr. Reham Alqahtani's official WhatsApp channel.",
    primaryCta: "Contact via WhatsApp",
    destinationCaption: "Opens official WhatsApp conversation:",
  },
};

export const aboutContentEn = {
  meta: {
    title: "About Dr. Reham Alqahtani | Oculoplastic & Eyelid Surgery",
    description:
      "Dr. Reham Alqahtani — Oculoplastic & Eyelid Surgery in Riyadh. Precision in care and harmony in aesthetics.",
  },
  header: {
    eyebrow: "PROFESSIONAL PROFILE",
    name: "Dr. Reham Alqahtani",
    specialty: "Oculoplastic & Eyelid Surgery",
    city: "Riyadh",
    lead: "Specialized medical care focused on the delicate anatomy of the eyelids and periocular region, guided by respect for natural facial harmony and vital ocular function.",
  },
  introduction: {
    heading: "Subspecialty Focus & Clinical Philosophy",
    paragraphs: [
      "Dr. Reham Alqahtani practices Oculoplastic and Eyelid Surgery in Riyadh, a dedicated subspecialty addressing both the functional and aesthetic evaluation of the eyelids and periocular contour.",
      "Her philosophy of care rests on the conviction that the eye region never lends itself to formulaic solutions; every face carries its own anatomical nuances, requiring an unhurried consultation and transparent communication that place ocular safety first.",
    ],
  },
  approach: {
    heading: "Pillars of Consultation & Care",
    items: [
      {
        number: "01",
        title: "Careful Anatomical Assessment",
        text: "Dedicating sufficient time to understand what the patient notices around the eyes and eyelids, paired with a direct examination that balances function and aesthetics.",
      },
      {
        number: "02",
        title: "Clarity & Transparency",
        text: "Explaining suitable options in calm, evidence-informed language, free from exaggerated promises or generalized assumptions.",
      },
      {
        number: "03",
        title: "Respecting Natural Facial Identity",
        text: "Focusing on balanced outcomes that preserve natural facial expressions and harmonize with the individual's gaze.",
      },
    ],
  },
  factualSpine: [
    {
      label: "Name",
      value: "Dr. Reham Alqahtani",
    },
    {
      label: "Specialty",
      value: "Oculoplastic & Eyelid Surgery",
    },
    {
      label: "City",
      value: "Riyadh, Saudi Arabia",
    },
    {
      label: "WhatsApp Inquiry",
      value: siteConfig.whatsappDisplay,
      href: siteConfig.whatsappUrl,
      isLtr: true,
    },
    {
      label: "Official Channel",
      value: "@dr.rehamdq",
      href: "https://www.instagram.com/dr.rehamdq/",
      isLtr: true,
    },
  ],
};

export const journalPageCopyEn = {
  meta: {
    title: "Articles & Patient Education | Dr. Reham Alqahtani",
    description:
      "Learn & Stay Informed — Educational articles and practical guidance on eyelids, periocular care, and consultation preparation.",
  },
  eyebrow: "PATIENT EDUCATION",
  headline: "Learn & Stay Informed",
  intro:
    "Expert articles and practical guidance on eyelid anatomy, periocular care, and preparing for your consultation.",
  featuredBadge: "Featured Article",
  readArticleCta: "Read Article",
  searchPlaceholder: "Search article titles and summaries...",
  searchLabel: "Search articles",
  clearSearchLabel: "Clear search",
  categoryFilterLabel: "Filter articles by category",
  emptySearchState: {
    title: "No articles match your search",
    message:
      "Try searching with different keywords or selecting another category to explore available readings.",
    resetCta: "Reset search & category",
  },
  directVisitState: {
    title: "Educational Content on Official Channels",
    message:
      "Dr. Reham Alqahtani shares educational insights on eyelid and periocular care through her official Instagram account.",
    primaryCta: "Visit Official Instagram",
    secondaryCta: "Back to Home",
  },
  articleLabels: {
    breadcrumbJournal: "Articles",
    backToJournal: "Back to All Articles",
    draftBadge: "Draft for Review",
    previewNotice:
      "Editorial preview copy; published publicly only after formal clinical review and approval.",
    tocHeading: "Table of Contents",
    authorPrefix: "Author:",
    reviewedByPrefix: "Medical Review:",
    publishedAtPrefix: "Published:",
    sourcesHeading: "Institutional Sources & References",
    shareHeading: "Share Article",
    shareButton: "Share Article",
    copyLinkButton: "Copy Link",
    copiedFeedback: "Link Copied",
    relatedArticlesHeading: "Related Articles",
    relatedServicesHeading: "Related Services",
    calmInquiryEyebrow: "DIRECT INQUIRY",
    calmInquiryTitle: "Have a question about an appointment or visit?",
    calmInquiryText:
      "For appointment inquiries in Riyadh, connect directly via Dr. Reham Alqahtani's official WhatsApp or verified Instagram account.",
    calmInquiryCta: "Contact via WhatsApp",
    disclaimer:
      "This material is provided for general health education only and does not constitute a personal diagnosis, treatment recommendation, or substitute for an in-person medical examination.",
    translationPendingTitle: "English Translation Under Review",
    translationPendingMessage:
      "This article is currently published in Arabic while its English medical review is being finalized.",
    translationPendingCta: "Read the Arabic Version",
  },
};

export const faqPageCopyEn = {
  meta: {
    title: "Education & FAQ | Dr. Reham Alqahtani",
    description:
      "Practical questions and preparatory guidance for consultations with Dr. Reham Alqahtani — Oculoplastic & Eyelid Surgery in Riyadh.",
  },
  eyebrow: "PATIENT EDUCATION & VISIT INFO",
  headline: "Practical Questions & Guidance",
  intro:
    "Clear, concise answers regarding how to inquire about appointments and prepare for your consultation.",
  categoryTitles: {
    appointments: "Appointments & Contact",
    consultation: "Preparing for Consultation",
    procedure: "Care & Procedures",
  } satisfies Record<FaqCategory, string>,
  directVisitState: {
    title: "Have an additional question before your visit?",
    message:
      "You can reach out directly for appointment inquiries in Riyadh through Dr. Reham Alqahtani's official communication channels.",
    primaryCta: "Contact via WhatsApp",
    secondaryCta: "Back to Home",
  },
};

export const faqTranslationsEn: Record<
  string,
  { question: string; answer: string }
> = {
  "how-to-inquire-appointments": {
    question: "How can I inquire about appointments and clinic visits?",
    answer: `Appointment inquiries in Riyadh are welcomed directly via our official WhatsApp (${siteConfig.whatsappDisplay}) or through Dr. Reham Alqahtani's verified Instagram account (@dr.rehamdq). Please avoid sending private medical reports or clinical photos over public messages.`,
  },
  "what-to-prepare-before-consultation": {
    question: "What is helpful to prepare before attending a consultation?",
    answer:
      "We recommend jotting down your main observations and questions, bringing a list of any lubricating or prescription eye drops and current medications, and having any prior eye examination reports available.",
  },
  "can-case-be-assessed-by-messages": {
    question:
      "Can my eyelid condition or suitable procedure be determined via messages?",
    answer:
      "Communication channels and published articles are intended for scheduling inquiries and general education only. Accurate anatomical evaluation and discussion of suitable options take place exclusively during an in-person clinical examination.",
  },
  "how-to-use-educational-articles": {
    question: "How can I make the best use of the educational articles before my visit?",
    answer:
      "Our articles are designed to clarify common terminology around the eyelids and periocular area and help you organize your thoughts prior to your appointment; they serve as general educational reading rather than personal medical advice.",
  },
};

export const bookPageCopyEn = {
  meta: {
    previewTitle: "Contact & Consultation | Dr. Reham Alqahtani",
    liveTitle: "Appointments & Contact | Dr. Reham Alqahtani",
    description:
      "Inquire about consultations and appointments with Dr. Reham Alqahtani — Oculoplastic & Eyelid Surgery in Riyadh.",
  },
  eyebrow: "APPOINTMENTS & INQUIRIES",
  previewHeading: "Book a Consultation Inquiry",
  liveHeading: "Appointments & Clinic Locations",
  introPreview:
    "For consultation and appointment inquiries in Riyadh, connect directly via official WhatsApp or Dr. Reham Alqahtani's verified Instagram channel.",
  introLive:
    "Select an approved clinic location in Riyadh to view verified address details and proceed to the official booking channel.",
  directInquiryCard: {
    badge: "VERIFIED OFFICIAL CHANNELS",
    title: "Direct Inquiry via WhatsApp & Instagram",
    phoneDisplay: siteConfig.whatsappDisplay,
    handle: "@dr.rehamdq",
    description:
      "You may send your inquiries regarding consultation availability in Riyadh directly via our official WhatsApp conversation, or follow updates on Dr. Reham Alqahtani's verified Instagram profile.",
    whatsappLabel: "Contact via WhatsApp",
    actionLabel: "Visit Official Instagram (@dr.rehamdq)",
    externalHint:
      "Links open in an external window. For your privacy, please do not share confidential medical records via public messages.",
  },
  selectorLabels: {
    groupLegend: "Select Approved Clinic",
    selectedClinicPrefix: "Selected Location",
    addressLabel: "Address",
    hoursLabel: "Working Hours",
    mapsLinkLabel: "View on Map",
    externalNoticeTitle: "External Booking Portal",
    invalidParamResetNote:
      "Showing the default approved clinic because the requested clinic identifier did not match.",
  },
  consultationGuidance: {
    heading: "Guidance Before Reaching Out",
    items: [
      {
        number: "01",
        title: "Specify the Purpose of Your Visit",
        description:
          "Letting the coordination team know whether you are requesting an initial consultation or a follow-up helps guide you to the appropriate slot.",
      },
      {
        number: "02",
        title: "Protecting Your Medical Privacy",
        description:
          "To safeguard your privacy, all detailed health history and clinical examinations are discussed directly during your in-clinic consultation.",
      },
    ],
  },
};

export const privacyPageCopyEn = {
  meta: {
    title: "Privacy Policy | Dr. Reham Alqahtani",
    description:
      "Privacy policy and data handling practices for Dr. Reham Alqahtani's official website.",
  },
  eyebrow: "TRANSPARENCY & DATA PROTECTION",
  headline: "Privacy Policy",
  sections: [
    {
      id: "operator",
      heading: "1. Website Identity & Contact",
      paragraphs: [
        "This website serves as the official informational platform for Dr. Reham Alqahtani (Oculoplastic & Eyelid Surgery — Riyadh).",
      ],
    },
    {
      id: "data-collected",
      heading: "2. Information Collected on This Website",
      paragraphs: [
        "This public website does not include patient intake forms, patient portals, payment gateways, or clinical photo upload forms.",
        "Visitors are never asked to submit personal health information while browsing informational pages.",
      ],
    },
    {
      id: "technical-logs",
      heading: "3. Standard Hosting Technical Logs",
      paragraphs: [
        "When you browse the website, hosting infrastructure may process standard technical request metadata necessary to deliver pages securely (such as IP address, browser type, and request timestamp).",
      ],
    },
    {
      id: "cookies-analytics",
      heading: "4. Cookies & Third-Party Trackers",
      paragraphs: [
        "This website does not run advertising trackers or non-essential third-party marketing cookies.",
      ],
    },
    {
      id: "external-links",
      heading: "5. External Communication Platforms",
      paragraphs: [
        "This website contains external links to official communication channels (such as WhatsApp and Instagram) and verified clinic portals.",
        "When you follow an external link, your interaction is governed by the privacy policy and terms of that independent platform.",
      ],
    },
  ],
};

export const servicesPageCopyEn = {
  meta: {
    title: "Expertise & Services | Dr. Reham Alqahtani",
    description:
      "Specialized Oculoplastic & Eyelid consultations and care with Dr. Reham Alqahtani in Riyadh.",
  },
  eyebrow: "CLINICAL SUBSPECIALTY",
  headline: "Expertise & Consultations",
  intro:
    "Appropriate functional and aesthetic options for the eyelids and periocular region are determined through direct examination during an in-person consultation.",
  directVisitState: {
    title: "Inquiring About Consultations & Services",
    message:
      "To provide accurate guidance tailored to each individual's anatomy, procedures and care options are discussed directly with Dr. Reham during your consultation.",
    primaryCta: "Contact via WhatsApp",
    secondaryCta: "About Dr. Reham",
  },
  detailLabels: {
    breadcrumbServices: "Expertise",
    overviewHeading: "Overview",
    consultationHeading: "Consultation Considerations",
    preparationHeading: "Preparation",
    recoveryHeading: "Recovery & Follow-up",
    risksHeading: "Potential Risks & Considerations",
    faqHeading: "Related Questions",
    relatedHeading: "Related Areas",
    reviewedByPrefix: "Reviewed by:",
    reviewedAtPrefix: "Updated:",
  },
};

export const notFoundCopyEn = {
  meta: {
    title: "Page Not Found | Dr. Reham Alqahtani",
    description: "The requested page is unavailable or has not been published.",
  },
  code: "404",
  headline: "Page Not Found",
  description:
    "The link you followed may be incorrect or refers to a page that has not yet been approved for public publication.",
  homeCta: "Back to Home",
  bookingInfoCta: "Consultation Info",
};

export const articlesTranslationsEn: Record<string, ArticleLocaleContent> = {
  "hooded-vs-deep-set-eyelid": {
    title: "Eyelid Fold & Deep-Set Eyes: Understanding the Anatomical Difference",
    excerpt:
      "Many people confuse a hooded upper eyelid fold with a deep-set eye contour. This educational guide explains the anatomical distinctions between skin fold, crease height, and brow bone projection.",
    category: "Eyelids & Orbit",
    status: "published",
    reviewedBy: "Editorial Medical Review",
    reviewedAt: "2026-10-29",
    publishedAt: "2026-10-29",
    seo: {
      title: "Eyelid Fold vs. Deep-Set Eyes: Anatomical Differences",
      description:
        "An educational overview explaining the difference between hooded eyelids and deep-set eyes in terms of upper eyelid skin and brow bone structure.",
    },
    body: [
      {
        id: "why-terms-matter",
        heading: "Why Do Hooded Eyelids and Deep-Set Eyes Look Similar?",
        paragraphs: [
          "When looking in the mirror or in photographs, it is common to describe any upper eyelid where the mobile lid platform is less visible as a 'hooded eyelid.' In practice, however, the appearance of the upper eyelid is shaped by several neighboring structures: the elasticity of the delicate eyelid skin, the height of the natural lid crease, the projection of the brow bone, and the position of the eye within the bony orbit.",
          "Understanding these terms in a clear, accessible way helps you describe what you notice during a specialist consultation without jumping to conclusions about a specific procedure.",
        ],
      },
      {
        id: "what-is-hooded-eyelid",
        heading: "What Is Meant by a Hooded Eyelid?",
        paragraphs: [
          "In everyday usage, a hooded eyelid refers to a soft fold of skin extending from beneath the eyebrow that partially drapes over the natural upper eyelid crease. This contour can be a completely normal hereditary feature present from a young age, or it may become more noticeable over time as the thin skin of the upper eyelid loses elasticity or the brow position shifts slightly.",
          "Educational resources from the American Academy of Ophthalmology (AAO) note that eyelid skin is the thinnest skin on the body, making it the first to show subtle changes in laxity or fullness. While often a natural variation, an in-person evaluation is helpful when heaviness affects upper eyelid comfort or the superior visual field.",
        ],
        bullets: [
          "The mobile eyelid platform appears narrower when looking straight ahead.",
          "May reflect natural hereditary anatomy or gradual tissue laxity over time.",
          "Strongly influenced by eyebrow position, not eyelid skin alone.",
        ],
      },
      {
        id: "what-is-deep-set-eye",
        heading: "What Is Meant by a Deep-Set Eye?",
        paragraphs: [
          "By contrast, a deep-set eye describes the spatial relationship between the globe and the surrounding orbital rim, where the eye sits slightly further back relative to a more prominent superior brow bone. This bony architecture casts a natural shadow beneath the brow while the eyelid crease near the lash line often remains well defined.",
          "In other words, a deep-set contour primarily reflects bone structure and deep tissue distribution rather than excess upper eyelid skin—though both traits can coexist in varying degrees.",
        ],
        bullets: [
          "More prominent brow ridge casting a natural shadow under the brow.",
          "Upper lid crease near the eyelashes often remains visible.",
          "Appearance shifts noticeably with overhead lighting and camera angle.",
        ],
      },
      {
        id: "clinical-examination-role",
        heading: "How Is This Distinction Evaluated in Consultation?",
        paragraphs: [
          "A specialist eyelid evaluation looks beyond popular labels to examine brow position, skin laxity, levator muscle function, and ocular surface health. Distinguishing between a simple skin fold, brow descent, and true eyelid margin droop (ptosis) requires a direct clinical examination rather than photographs alone.",
        ],
      },
    ],
  },
  "tired-eye-appearance": {
    title: "Understanding Tear Comfort & Periocular Fatigue Factors",
    excerpt:
      "The area around the eyes can appear tired or feel dry even after adequate rest. Learn how tear film balance, delicate skin anatomy, and fluid dynamics interact around the eyelids.",
    category: "Periocular Care",
    status: "published",
    reviewedBy: "Editorial Medical Review",
    reviewedAt: "2026-10-29",
    publishedAt: "2026-10-29",
    seo: {
      title: "Understanding Tear Comfort & Periocular Fatigue Factors",
      description:
        "Educational guide to the anatomical, vascular, and tear-film factors influencing under-eye shadows, fullness, and ocular comfort.",
    },
    body: [
      {
        id: "beyond-sleep",
        heading: "More Than Just Lack of Sleep",
        paragraphs: [
          "A tired appearance around the eyes is frequently attributed solely to late nights or screen fatigue. Yet clinical references from the Mayo Clinic and the American Academy of Ophthalmology emphasize that the lower eyelid and tear trough reflect a delicate interplay between thin skin, superficial blood vessels, supportive fat pads, tear film stability, and facial bone structure.",
          "Because of this complexity, two individuals may notice similar under-eye shadows or morning fullness for entirely different underlying reasons.",
        ],
      },
      {
        id: "shadows-vs-pigmentation",
        heading: "True Skin Pigmentation vs. Contour Shadowing",
        paragraphs: [
          "One of the most important distinctions during an examination is separating true skin hyperpigmentation from optical shadowing caused by a natural depression along the tear trough or mild fullness above it. Overhead lighting falling across subtle curves creates a dark shadow even when the skin tone itself is unchanged.",
          "True discoloration, on the other hand, may stem from translucent skin revealing underlying vascular tone or from hereditary melanin pigment and chronic rubbing from eye irritation or dryness.",
        ],
        bullets: [
          "Optical shadows shift depending on lighting direction and head tilt.",
          "Vascular congestion often fluctuates in the morning or with nasal/ocular allergies.",
          "Tear film dryness or irritation can trigger frequent rubbing that worsens skin darkening.",
        ],
      },
      {
        id: "fluid-vs-tissue",
        heading: "Transient Morning Fluid vs. Structural Tissue Support",
        paragraphs: [
          "Under-eye fullness can be temporary—related to fluid retention (edema) upon waking, dietary salt, or seasonal allergies—or more constant when the fine supporting membranes around the natural orbital fat pads gradually relax over time. Identifying which factor predominates is essential before considering any care plan.",
        ],
      },
      {
        id: "when-to-note-symptoms",
        heading: "Helpful Observations Before Your Visit",
        paragraphs: [
          "Noting whether puffiness changes between morning and evening, and whether it is accompanied by dryness, burning, or reflex tearing, provides valuable context during your consultation.",
        ],
      },
    ],
  },
  "preparing-for-eyelid-consultation": {
    title: "Brow & Eyelid Harmony: How to Prepare for Your Consultation",
    excerpt:
      "Practical preparatory steps before your oculoplastic appointment to help you organize your observations, ocular history, and expectations for a clear clinical discussion.",
    category: "Consultation Prep",
    status: "published",
    reviewedBy: "Editorial Medical Review",
    reviewedAt: "2026-10-29",
    publishedAt: "2026-10-29",
    seo: {
      title: "Brow & Eyelid Harmony: Preparing for Your Consultation",
      description:
        "A practical guide to organizing your notes and health information before an eyelid and periocular consultation.",
    },
    body: [
      {
        id: "why-preparation-helps",
        heading: "Why Preparation Enhances Your Consultation",
        paragraphs: [
          "An eyelid and periocular consultation brings together two complementary priorities: safeguarding the functional health of the ocular surface and evaluating the natural harmony of the brows and eyelids. Arriving with organized notes allows more time for a focused examination and thoughtful discussion.",
          "Patient guidance from the UK National Health Service (NHS) highlights that simple preparation before an appointment helps ensure none of your key questions are overlooked.",
        ],
      },
      {
        id: "organize-your-notes",
        heading: "1. Note Your Observations and Timeline",
        paragraphs: [
          "Write down what prompted your visit in your own words. You do not need medical terminology—simply describe what you notice in the mirror or in daily visual comfort, when it began, and whether it fluctuates throughout the day.",
        ],
        bullets: [
          "Summarize your main observation or concern in one or two clear sentences.",
          "Note whether it affects one eye or both eyes.",
          "Mention any associated symptoms such as dryness, watering, or eyelid heaviness.",
        ],
      },
      {
        id: "bring-current-items",
        heading: "2. Bring Eye Drops, Medications, and Prior Records",
        paragraphs: [
          "Bring a list or photos of any lubricating or medicated eye drops you use, along with regular medications, supplements, and known allergies. We also recommend attending without heavy eye makeup so the eyelid skin, margin, and lashes can be examined clearly.",
        ],
        bullets: [
          "Current medications and eye drops (never discontinue prescribed medication without medical advice).",
          "Summaries of any previous eye, laser vision, or facial procedures.",
          "Your current prescription glasses or contact lens details.",
        ],
      },
      {
        id: "realistic-mindset",
        heading: "3. Approach the Visit as a Calm, Collaborative Dialogue",
        paragraphs: [
          "The primary goal of a consultation is thorough examination and shared understanding—giving you clear, individualized information so you can make any future decision at ease.",
        ],
      },
    ],
  },
  "questions-to-ask-during-consultation": {
    title: "Questions You Can Ask During Your Eyelid Consultation",
    excerpt:
      "A structured list of practical questions to help you understand your clinical evaluation, explore conservative and procedural options, and set realistic expectations.",
    category: "Consultation Prep",
    status: "published",
    reviewedBy: "Editorial Medical Review",
    reviewedAt: "2026-10-29",
    publishedAt: "2026-10-29",
    seo: {
      title: "Questions to Ask During Your Eyelid Consultation",
      description:
        "Helpful questions to ask during an oculoplastic and eyelid consultation to support informed decision-making.",
    },
    body: [
      {
        id: "shared-understanding",
        heading: "Clear Dialogue Is the Foundation of Sound Care",
        paragraphs: [
          "Your consultation is an opportunity to understand what the specialist observes during the examination. Asking structured questions helps clarify the anatomical basis of your concern and establishes realistic, individualized expectations.",
        ],
      },
      {
        id: "questions-about-assessment",
        heading: "Questions About Your Anatomical Assessment",
        paragraphs: [
          "After the clinical examination of your eyelids and periocular area, consider asking:",
        ],
        bullets: [
          "What is the primary anatomical factor behind the change I notice in my eyelid or under-eye area?",
          "Is this appearance related to eyelid skin alone, or do brow position, tear film dryness, or allergies play a role?",
          "Is there a functional aspect affecting ocular comfort or visual field alongside appearance?",
        ],
      },
      {
        id: "questions-about-options",
        heading: "Questions About Available Options",
        paragraphs: [
          "When discussing potential next steps, ask about the full spectrum of care—including conservative support or observation:",
        ],
        bullets: [
          "What options are appropriate for my specific anatomy, and how do conservative and surgical approaches compare?",
          "What realistic outcome can be expected while preserving my natural facial expressions?",
          "Is intervention advisable now, or is supportive care and periodic follow-up sufficient?",
        ],
      },
      {
        id: "questions-about-recovery",
        heading: "Questions About Recovery and Follow-Up",
        paragraphs: [
          "If a procedure is discussed, understanding preparation, healing stages, and precautions is essential:",
        ],
        bullets: [
          "What does the typical healing timeline look like as tissues gradually settle?",
          "What temporary side effects are expected, and what signs warrant early contact with the clinic?",
          "How does my ocular surface health (such as dry eye) influence the care plan?",
        ],
      },
    ],
  },
  "information-that-helps-your-doctor": {
    title: "What Health Information Helps Your Specialist Understand Your Concern?",
    excerpt:
      "Eyelid health is closely linked to ocular surface comfort and general medical history. Discover the key details worth sharing during your consultation.",
    category: "Consultation Prep",
    status: "published",
    reviewedBy: "Editorial Medical Review",
    reviewedAt: "2026-10-29",
    publishedAt: "2026-10-29",
    seo: {
      title: "Health Information That Helps Your Eyelid Specialist",
      description:
        "Learn why ocular surface symptoms, general health history, and prior procedures matter during an eyelid consultation.",
    },
    body: [
      {
        id: "holistic-eye-context",
        heading: "Why General Health Details Matter in Eyelid Care",
        paragraphs: [
          "Patients are sometimes surprised when an eyelid specialist asks about dry eyes, seasonal allergies, thyroid health, or daily medications during a visit focused on eyelid appearance. Yet the eyelids are the primary protective shield for the cornea, distributing the tear film with every blink.",
          "Clinical guidelines from the American Academy of Ophthalmology and Mayo Clinic emphasize that responsible eyelid evaluation always begins with ocular surface safety and systemic health context.",
        ],
      },
      {
        id: "ocular-surface-symptoms",
        heading: "1. Ocular Surface & Tear Film Symptoms",
        paragraphs: [
          "Sharing everyday comfort symptoms gives your doctor vital information for protecting your eyes:",
        ],
        bullets: [
          "Dryness, burning, or a gritty sensation, especially later in the day.",
          "Excessive watering in wind or bright light, or recurrent eyelid margin redness.",
          "Contact lens wear schedule and any history of laser vision correction or intraocular surgery.",
        ],
      },
      {
        id: "general-health-and-medications",
        heading: "2. Medical History & Regular Medications",
        paragraphs: [
          "Conditions such as thyroid imbalance, chronic allergies, hypertension, or skin sensitivities can influence periocular tissues, while certain medications and supplements affect bruising or fluid retention. Always share a complete list with your physician.",
        ],
      },
      {
        id: "prior-procedures-and-timeline",
        heading: "3. Prior Facial or Periocular Procedures",
        paragraphs: [
          "Informing your doctor of any previous treatments around the forehead, brow, eyelids, or cheeks—along with their approximate timing—helps ensure a safe, accurate assessment of muscle movement and tissue planes.",
        ],
      },
    ],
  },
  "reading-before-and-after-photos-realistically": {
    title: "How to Read Before-and-After Photos Realistically",
    excerpt:
      "Visual comparisons are widespread online, but understanding lighting, healing timelines, and individual bone structure helps you interpret them objectively.",
    category: "Eyelids & Orbit",
    status: "published",
    reviewedBy: "Editorial Medical Review",
    reviewedAt: "2026-10-29",
    publishedAt: "2026-10-29",
    seo: {
      title: "How to Read Before-and-After Eyelid Photos Realistically",
      description:
        "An educational guide to evaluating clinical photographs objectively and building realistic, anatomy-first expectations.",
    },
    body: [
      {
        id: "why-photos-never-tell-full-story",
        heading: "Why Still Photographs Never Tell the Full Story",
        paragraphs: [
          "While standardized clinical photographs can illustrate general principles, patient education guidance from the NHS and the American Academy of Ophthalmology reminds readers that a static photo of another person never defines what is right for your own face.",
          "The periocular region moves continuously with every expression, and outcomes depend on bone structure, skin elasticity, age, and ocular surface health.",
        ],
      },
      {
        id: "lighting-and-angle-effects",
        heading: "The Impact of Lighting, Camera Angle, and Expression",
        paragraphs: [
          "Subtle changes from harsh overhead lighting to soft frontal illumination—or a slight chin tilt and brow elevation—can dramatically alter the appearance of upper eyelid folds and under-eye shadows without any intervention at all.",
        ],
        bullets: [
          "Consistent head position and camera level are essential for fair comparison.",
          "Uniform lighting direction and absence of digital skin retouching.",
          "Relaxed forehead and brow muscles without squinting or smiling.",
        ],
      },
      {
        id: "healing-timeline-factor",
        heading: "Healing Timelines and Tissue Settling",
        paragraphs: [
          "Delicate eyelid tissues pass through natural stages of mild swelling before gradually settling over several months. Objective clinical evaluation always considers long-term tissue stability rather than immediate snapshots.",
        ],
      },
      {
        id: "individual-anatomy-first",
        heading: "Your Natural Features Are the Primary Reference",
        paragraphs: [
          "The highest goal in oculoplastic care is preserving ocular comfort and vital function while achieving calm, natural harmony that respects your individual identity.",
        ],
      },
    ],
  },
};
