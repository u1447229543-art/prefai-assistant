import { LanguageCode } from '../constants/languages';

/**
 * UI string dictionary. English is the master/fallback.
 * Other languages may be partial; missing keys fall back to English.
 */

export type TranslationKey =
  | 'appName'
  | 'tagline'
  | 'continue'
  | 'skip'
  | 'getStarted'
  | 'next'
  | 'back'
  | 'cancel'
  | 'save'
  | 'delete'
  | 'loading'
  | 'error'
  | 'retry'
  | 'send'
  | 'upload'
  | 'copy'
  | 'copied'
  | 'share'
  // tabs
  | 'tabHome'
  | 'tabDocuments'
  | 'tabChat'
  | 'tabProfile'
  // home
  | 'greeting'
  | 'homeSubtitle'
  | 'features'
  | 'recentDocuments'
  | 'noDocuments'
  | 'quickActions'
  | 'viewAll'
  // feature titles
  | 'featExplain'
  | 'featExplainDesc'
  | 'featTranslate'
  | 'featTranslateDesc'
  | 'featReply'
  | 'featReplyDesc'
  | 'featForm'
  | 'featFormDesc'
  | 'featDeadlines'
  | 'featDeadlinesDesc'
  | 'featVault'
  | 'featVaultDesc'
  | 'featPdf'
  | 'featPdfDesc'
  | 'featGuides'
  | 'featGuidesDesc'
  // explain
  | 'explainTitle'
  | 'explainUpload'
  | 'explainAnalyzing'
  | 'summary'
  | 'keyPoints'
  | 'deadlines'
  | 'nextSteps'
  // translate
  | 'translateTitle'
  | 'translateFrom'
  | 'translateTo'
  | 'enterText'
  | 'translateBtn'
  | 'result'
  // reply
  | 'replyTitle'
  | 'selectOrg'
  | 'describeSituation'
  | 'generateReply'
  // form
  | 'formTitle'
  | 'formInputLabel'
  | 'explainForm'
  | 'requiredDocs'
  // deadlines
  | 'deadlinesTitle'
  | 'upcoming'
  | 'noDeadlines'
  | 'markDone'
  // vault
  | 'vaultTitle'
  | 'vaultSubtitle'
  | 'addDocument'
  | 'categories'
  // chat
  | 'chatTitle'
  | 'chatPlaceholder'
  | 'chatWelcome'
  // pdf
  | 'pdfTitle'
  | 'pdfPurpose'
  | 'pdfRecipient'
  | 'generatePdf'
  | 'exportPdf'
  // guides
  | 'guidesTitle'
  // profile
  | 'profileTitle'
  | 'language'
  | 'subscription'
  | 'settings'
  | 'logout'
  | 'currentPlan'
  | 'upgrade'
  | 'manageSubscription'
  // subscription
  | 'subscriptionTitle'
  | 'choosePlan'
  | 'perMonth'
  | 'mostPopular'
  | 'currentPlanLabel'
  | 'selectPlan'
  // auth
  | 'login'
  | 'register'
  | 'email'
  | 'password'
  | 'name'
  | 'noAccount'
  | 'haveAccount'
  | 'welcomeBack'
  | 'createAccount'
  // misc
  | 'documentsThisMonth'
  | 'disclaimer';

type Dict = Partial<Record<TranslationKey, string>>;

const en: Record<TranslationKey, string> = {
  appName: 'PrefAI Assistant',
  tagline: 'Your French bureaucracy assistant',
  continue: 'Continue',
  skip: 'Skip',
  getStarted: 'Get Started',
  next: 'Next',
  back: 'Back',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  loading: 'Loading…',
  error: 'Something went wrong',
  retry: 'Retry',
  send: 'Send',
  upload: 'Upload Document',
  copy: 'Copy',
  copied: 'Copied!',
  share: 'Share',
  tabHome: 'Home',
  tabDocuments: 'Documents',
  tabChat: 'Chat',
  tabProfile: 'Profile',
  greeting: 'Bonjour',
  homeSubtitle: 'How can I help with French admin today?',
  features: 'Features',
  recentDocuments: 'Recent Documents',
  noDocuments: 'No documents yet. Upload one to get started.',
  quickActions: 'Quick Actions',
  viewAll: 'View all',
  featExplain: 'Explain Document',
  featExplainDesc: 'Understand any letter in simple language',
  featTranslate: 'Translate',
  featTranslateDesc: 'French → your language, admin-aware',
  featReply: 'AI Reply',
  featReplyDesc: 'Draft official French responses',
  featForm: 'Form Assist',
  featFormDesc: 'What to write in each field',
  featDeadlines: 'Deadlines',
  featDeadlinesDesc: 'Never miss an important date',
  featVault: 'Document Vault',
  featVaultDesc: 'Securely store your papers',
  featPdf: 'PDF Letters',
  featPdfDesc: 'Generate official letters',
  featGuides: 'Guides',
  featGuidesDesc: 'CAF, CPAM, Préfecture & more',
  explainTitle: 'Explain Document',
  explainUpload: 'Upload a document to explain',
  explainAnalyzing: 'Analyzing your document…',
  summary: 'Summary',
  keyPoints: 'Key Points',
  deadlines: 'Deadlines',
  nextSteps: 'Next Steps',
  translateTitle: 'Translate',
  translateFrom: 'From',
  translateTo: 'To',
  enterText: 'Paste French text here…',
  translateBtn: 'Translate',
  result: 'Result',
  replyTitle: 'AI Reply Generator',
  selectOrg: 'Select organization',
  describeSituation: 'Describe your situation…',
  generateReply: 'Generate Reply',
  formTitle: 'Form Assistant',
  formInputLabel: 'Which form do you need help with?',
  explainForm: 'Explain Form',
  requiredDocs: 'Required Documents',
  deadlinesTitle: 'Deadline Tracker',
  upcoming: 'Upcoming',
  noDeadlines: 'No deadlines tracked yet.',
  markDone: 'Mark done',
  vaultTitle: 'Document Vault',
  vaultSubtitle: 'Your documents, securely stored on this device',
  addDocument: 'Add Document',
  categories: 'Categories',
  chatTitle: 'AI Assistant',
  chatPlaceholder: 'Ask anything about French admin…',
  chatWelcome: 'Hi! I can help with CAF, CPAM, Préfecture, taxes and more. What do you need?',
  pdfTitle: 'PDF Generator',
  pdfPurpose: 'Purpose of the letter',
  pdfRecipient: 'Recipient (e.g. CAF de Paris)',
  generatePdf: 'Generate Letter',
  exportPdf: 'Export as PDF',
  guidesTitle: 'Guides',
  profileTitle: 'Profile',
  language: 'Language',
  subscription: 'Subscription',
  settings: 'Settings',
  logout: 'Log out',
  currentPlan: 'Current plan',
  upgrade: 'Upgrade',
  manageSubscription: 'Manage subscription',
  subscriptionTitle: 'Plans & Pricing',
  choosePlan: 'Choose the plan that fits you',
  perMonth: '/month',
  mostPopular: 'MOST POPULAR',
  currentPlanLabel: 'Current Plan',
  selectPlan: 'Select',
  login: 'Log in',
  register: 'Register',
  email: 'Email',
  password: 'Password',
  name: 'Full name',
  noAccount: "Don't have an account? Register",
  haveAccount: 'Already have an account? Log in',
  welcomeBack: 'Welcome back',
  createAccount: 'Create your account',
  documentsThisMonth: 'documents this month',
  disclaimer:
    'PrefAI helps you understand French administration. It does not replace official government services.',
};

const fr: Dict = {
  tagline: 'Votre assistant administratif français',
  continue: 'Continuer',
  skip: 'Passer',
  getStarted: 'Commencer',
  next: 'Suivant',
  back: 'Retour',
  cancel: 'Annuler',
  save: 'Enregistrer',
  delete: 'Supprimer',
  send: 'Envoyer',
  upload: 'Importer un document',
  tabHome: 'Accueil',
  tabDocuments: 'Documents',
  tabChat: 'Chat',
  tabProfile: 'Profil',
  greeting: 'Bonjour',
  homeSubtitle: "Comment puis-je vous aider aujourd'hui ?",
  features: 'Fonctionnalités',
  recentDocuments: 'Documents récents',
  summary: 'Résumé',
  keyPoints: 'Points clés',
  deadlines: 'Échéances',
  nextSteps: 'Prochaines étapes',
  language: 'Langue',
  subscription: 'Abonnement',
  settings: 'Paramètres',
  logout: 'Se déconnecter',
  chatWelcome:
    'Bonjour ! Je peux vous aider avec la CAF, la CPAM, la Préfecture, les impôts et plus. Que voulez-vous ?',
  disclaimer:
    "PrefAI vous aide à comprendre l'administration française. Il ne remplace pas les services officiels.",
};

const es: Dict = {
  tagline: 'Tu asistente para la burocracia francesa',
  continue: 'Continuar',
  skip: 'Omitir',
  getStarted: 'Empezar',
  next: 'Siguiente',
  tabHome: 'Inicio',
  tabDocuments: 'Documentos',
  tabChat: 'Chat',
  tabProfile: 'Perfil',
  greeting: 'Hola',
  homeSubtitle: '¿Cómo puedo ayudarte hoy?',
  features: 'Funciones',
  recentDocuments: 'Documentos recientes',
  summary: 'Resumen',
  keyPoints: 'Puntos clave',
  language: 'Idioma',
  subscription: 'Suscripción',
  logout: 'Cerrar sesión',
};

const ru: Dict = {
  tagline: 'Ваш помощник по французской бюрократии',
  continue: 'Продолжить',
  skip: 'Пропустить',
  getStarted: 'Начать',
  tabHome: 'Главная',
  tabDocuments: 'Документы',
  tabChat: 'Чат',
  tabProfile: 'Профиль',
  greeting: 'Здравствуйте',
  homeSubtitle: 'Чем я могу помочь сегодня?',
  features: 'Функции',
  recentDocuments: 'Недавние документы',
  summary: 'Краткое содержание',
  keyPoints: 'Ключевые моменты',
  language: 'Язык',
  subscription: 'Подписка',
  logout: 'Выйти',
};

const ar: Dict = {
  tagline: 'مساعدك في البيروقراطية الفرنسية',
  continue: 'متابعة',
  skip: 'تخطٍ',
  getStarted: 'ابدأ',
  tabHome: 'الرئيسية',
  tabDocuments: 'المستندات',
  tabChat: 'الدردشة',
  tabProfile: 'الملف',
  greeting: 'مرحبا',
  homeSubtitle: 'كيف يمكنني مساعدتك اليوم؟',
  features: 'الميزات',
  recentDocuments: 'المستندات الأخيرة',
  summary: 'ملخص',
  keyPoints: 'النقاط الرئيسية',
  language: 'اللغة',
  subscription: 'الاشتراك',
  logout: 'تسجيل الخروج',
};

const ka: Dict = {
  tagline: 'თქვენი ფრანგული ბიუროკრატიის ასისტენტი',
  continue: 'გაგრძელება',
  skip: 'გამოტოვება',
  getStarted: 'დაწყება',
  tabHome: 'მთავარი',
  tabDocuments: 'დოკუმენტები',
  tabChat: 'ჩატი',
  tabProfile: 'პროფილი',
  greeting: 'გამარჯობა',
  homeSubtitle: 'როგორ შემიძლია დაგეხმაროთ დღეს?',
  features: 'ფუნქციები',
  recentDocuments: 'ბოლო დოკუმენტები',
  summary: 'შეჯამება',
  keyPoints: 'მთავარი პუნქტები',
  language: 'ენა',
  subscription: 'გამოწერა',
  logout: 'გასვლა',
};

export const TRANSLATIONS: Record<LanguageCode, Dict> = {
  en,
  fr,
  es,
  ru,
  ar,
  ka,
  bn: {},
  zh: {},
  hi: {},
  pt: {},
};

export const ENGLISH = en;
