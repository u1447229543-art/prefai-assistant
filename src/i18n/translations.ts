import { LanguageCode } from '../constants/languages';
import { ar as arLocale } from './locales/ar';
import { bn as bnLocale } from './locales/bn';
import { es as esLocale } from './locales/es';
import { hi as hiLocale } from './locales/hi';
import { ka as kaLocale } from './locales/ka';
import { pt as ptLocale } from './locales/pt';
import { zh as zhLocale } from './locales/zh';
import { ELIGIBILITY_I18N, type EligibilityTranslationKey } from './eligibilityStrings';

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
  | 'tabJourney'
  | 'tabDocuments'
  | 'tabAI'
  | 'tabChat'
  | 'tabProfile'
  // home
  | 'greeting'
  | 'goodMorning'
  | 'goodAfternoon'
  | 'goodEvening'
  | 'friend'
  | 'homeSubtitle'
  | 'homeJourneyForward'
  | 'syncingJourney'
  | 'inDays'
  | 'days'
  | 'continueYourJourney'
  | 'startYourJourney'
  | 'tellUsWhatYouNeed'
  | 'chooseYourSituation'
  | 'currentStepLabel'
  | 'journeyCompleteLabel'
  | 'journeyCompleteEveryStep'
  | 'estimated'
  | 'todaysTasks'
  | 'checkYourEligibility'
  | 'checkEligibilityDesc'
  | 'quickAiTools'
  | 'allTools'
  | 'features'
  | 'recentDocuments'
  | 'noDocuments'
  | 'quickActions'
  | 'viewAll'
  // tasks
  | 'taskGatherDocs'
  | 'taskValidateVisa'
  | 'taskBankAccount'
  // journey
  | 'whatAreYouTrying'
  | 'pickSituationDesc'
  | 'change'
  | 'yourProgress'
  | 'stepsCompleted'
  | 'tapForDetails'
  | 'completedCheck'
  | 'markAsCompleted'
  | 'completedTapUndo'
  // ai hub
  | 'aiToolsTitle'
  | 'aiToolsSubtitle'
  | 'eligibilityChecker'
  | 'eligibilityCheckerDesc'
  // document categories
  | 'catAll'
  | 'catPassport'
  | 'catVisa'
  | 'catCaf'
  | 'catCpam'
  | 'catContract'
  | 'catContracts'
  | 'catTax'
  | 'catOther'
  | 'vaultEmpty'
  | 'vaultEmptySub'
  | 'loadingDocuments'
  | 'couldNotOpenPicker'
  | 'removeDocConfirm'
  | 'couldNotDeleteDoc'
  | 'couldNotReachServer'
  | 'uploadFailed'
  | 'uploadingToServer'
  | 'saveToCategory'
  | 'fileSelected'
  // journey step
  | 'stepLabel'
  | 'whyThisMatters'
  | 'stepByStep'
  | 'whatToBring'
  | 'findNearYou'
  | 'askAiAboutStep'
  | 'askAiBtn'
  | 'openOfficialSite'
  | 'aiSomethingWrong'
  | 'howLongQuestion'
  | 'commonMistakesLabel'
  | 'whatHappensNext'
  | 'stepNotFound'
  | 'completedLabel'
  // eligibility
  | 'eligibilityTitle'
  | 'yourResults'
  | 'questionOf'
  | 'startThisJourney'
  | 'startOver'
  | 'resultsHeading'
  | 'eligibilityNoMatch'
  | EligibilityTranslationKey
  // onboarding
  | 'onboardingSlide1Title'
  | 'onboardingSlide1Body'
  | 'onboardingSlide2Title'
  | 'onboardingSlide2Body'
  | 'onboardingSlide3Title'
  | 'onboardingSlide3Body'
  // auth extras
  | 'required'
  | 'optional'
  | 'errFirstNameRequired'
  | 'errLastNameRequired'
  | 'errEmailRequired'
  | 'errPasswordMin'
  | 'errDobIncomplete'
  | 'errEmailInvalid'
  | 'errRegisterFailed'
  | 'errLoginFailed'
  | 'idNumber'
  | 'address'
  | 'dateOfBirth'
  | 'passwordMinHint'
  | 'firstNamePlaceholder'
  | 'lastNamePlaceholder'
  | 'couldNotSaveProfile'
  | 'userFallback'
  | 'cityPlaceholder'
  // misc
  | 'editProfile'
  | 'saveProfile'
  | 'limitReached'
  | 'limitReachedMsg'
  | 'formal'
  | 'polite'
  | 'firm'
  | 'tone'
  | 'openPdf'
  | 'openFile'
  | 'pdfPreviewOpens'
  | 'filePreviewOpens'
  | 'pdfCreated'
  | 'missingInfo'
  | 'missingInfoMsg'
  | 'optionalDetails'
  | 'nationalityOptional'
  | 'idNumberOptional'
  | 'addressInFranceOptional'
  | 'profilePrivacyNote'
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
  | 'appSettings'
  | 'notifications'
  | 'darkMode'
  | 'saveChanges'
  | 'savedSuccess'
  | 'logout'
  | 'logoutConfirm'
  | 'currentPlan'
  | 'free'
  | 'planBasic'
  | 'planPro'
  | 'upgrade'
  | 'manageSubscription'
  | 'personalInformation'
  | 'firstName'
  | 'lastName'
  | 'nationality'
  | 'selectNationality'
  | 'addYourNationality'
  | 'cityInFrance'
  | 'phoneOptional'
  | 'memberSince'
  | 'yourJourney'
  | 'noJourneySelected'
  | 'changeJourney'
  | 'startJourney'
  | 'syncingProfile'
  | 'unlimitedDocuments'
  | 'of'
  | 'documentsUsedThisMonth'
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

const enCore: Dict = {
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
  tabJourney: 'Journey',
  tabDocuments: 'Documents',
  tabAI: 'AI',
  tabChat: 'Chat',
  tabProfile: 'Profile',
  greeting: 'Bonjour',
  goodMorning: 'Good morning',
  goodAfternoon: 'Good afternoon',
  goodEvening: 'Good evening',
  friend: 'friend',
  homeSubtitle: 'How can I help with French admin today?',
  homeJourneyForward: "Let's move your administrative journey forward.",
  syncingJourney: 'Syncing journey progress…',
  inDays: 'in',
  days: 'days',
  continueYourJourney: 'Continue your Journey',
  startYourJourney: 'Start your Journey',
  tellUsWhatYouNeed: "Tell us what you're trying to do",
  chooseYourSituation: 'Choose your situation',
  currentStepLabel: 'CURRENT STEP',
  journeyCompleteLabel: 'JOURNEY COMPLETE 🎉',
  journeyCompleteEveryStep: "You've completed every step of",
  estimated: 'Estimated',
  todaysTasks: "Today's Tasks",
  checkYourEligibility: 'Check your eligibility',
  checkEligibilityDesc: 'See which French benefits you may qualify for',
  quickAiTools: 'Quick AI Tools',
  allTools: 'All tools',
  taskGatherDocs: 'Gather your passport & proof of address',
  taskValidateVisa: 'Validate your visa online (if not done)',
  taskBankAccount: 'Open or confirm your French bank account',
  whatAreYouTrying: 'What are you trying to do?',
  pickSituationDesc: "Pick your situation and we'll build a step-by-step roadmap for you.",
  change: 'Change',
  yourProgress: 'Your progress',
  stepsCompleted: 'steps completed',
  tapForDetails: 'Tap for full details',
  completedCheck: 'Completed ✓',
  markAsCompleted: 'Mark as completed',
  completedTapUndo: 'Completed ✓ — tap to undo',
  aiToolsTitle: 'AI Tools',
  aiToolsSubtitle: 'Smart help for French paperwork',
  eligibilityChecker: 'Eligibility Checker',
  eligibilityCheckerDesc: 'Check your eligibility for French benefits in 10 quick questions.',
  catAll: 'All',
  catPassport: 'Passport',
  catVisa: 'Visa',
  catCaf: 'CAF',
  catCpam: 'CPAM',
  catContract: 'Contract',
  catContracts: 'Contracts',
  catTax: 'Tax',
  catOther: 'Other',
  vaultEmpty: 'Your vault is empty',
  vaultEmptySub: 'Add your passport, visa, CAF and CPAM documents to keep them handy and organized.',
  loadingDocuments: 'Loading documents from server…',
  couldNotOpenPicker: 'Could not open the file picker.',
  removeDocConfirm: 'Remove this document from your vault?',
  couldNotDeleteDoc: 'Could not delete document.',
  couldNotReachServer: 'Could not reach the server. Document not uploaded.',
  uploadFailed: 'Upload failed. Please try again.',
  uploadingToServer: 'Uploading to server…',
  saveToCategory: 'Save to category',
  fileSelected: 'Selected',
  stepLabel: 'Step',
  whyThisMatters: 'Why this matters',
  stepByStep: 'Step by step',
  whatToBring: 'What to bring',
  findNearYou: 'Find it near you',
  askAiAboutStep: 'Ask AI about this step',
  askAiBtn: 'Ask AI about this step',
  openOfficialSite: 'Open official government website',
  aiSomethingWrong: 'Something went wrong. Please try again.',
  howLongQuestion: 'How long does this usually take?',
  commonMistakesLabel: 'Common mistakes',
  whatHappensNext: 'What happens next',
  stepNotFound: 'This step could not be found.',
  completedLabel: 'Completed',
  eligibilityTitle: 'Eligibility Checker',
  yourResults: 'Your results',
  questionOf: 'Question',
  startThisJourney: 'Start this journey',
  startOver: 'Start over',
  resultsHeading: 'Based on your answers, you may qualify for:',
  eligibilityNoMatch:
    "We couldn't confidently match a benefit from your answers. This doesn't mean you're not eligible — please verify directly with the relevant French authority.",
  onboardingSlide1Title: 'Understand any French letter',
  onboardingSlide1Body:
    'Upload a document from CAF, CPAM, Préfecture or Impôts and get a clear explanation in your language.',
  onboardingSlide2Title: 'Reply & fill forms with confidence',
  onboardingSlide2Body:
    'Generate official French responses, understand every form field, and never miss a deadline again.',
  onboardingSlide3Title: 'Your documents, organized & safe',
  onboardingSlide3Body:
    'Store passport, visa and contracts securely on your device. PrefAI helps you — it never replaces official services.',
  required: 'Required',
  optional: 'Optional',
  errFirstNameRequired: 'First name is required.',
  errLastNameRequired: 'Last name is required.',
  errEmailRequired: 'A valid email address is required.',
  errPasswordMin: 'Password must be at least 6 characters.',
  errDobIncomplete: 'Please complete all three date of birth fields, or leave them empty.',
  errEmailInvalid: 'Enter a valid email address.',
  errRegisterFailed: 'Registration failed. Please try again.',
  errLoginFailed: 'Login failed. Please try again.',
  idNumber: 'ID / Passport number',
  address: 'Address',
  dateOfBirth: 'Date of birth',
  passwordMinHint: '(min. 6 characters)',
  firstNamePlaceholder: 'First name (Prénom)',
  lastNamePlaceholder: 'Last name (Nom de famille)',
  couldNotSaveProfile: 'Could not save profile.',
  userFallback: 'User',
  cityPlaceholder: 'e.g. Paris',
  editProfile: 'Edit Profile',
  saveProfile: 'Save profile',
  limitReached: 'Limit reached',
  limitReachedMsg: 'You have used all your documents this month. Upgrade your plan to continue.',
  formal: 'Formal',
  polite: 'Polite',
  firm: 'Firm',
  tone: 'Tone',
  openPdf: 'Open PDF',
  openFile: 'Open file',
  pdfPreviewOpens: 'PDF preview opens in your device viewer.',
  filePreviewOpens: 'This file type opens in your device viewer.',
  pdfCreated: 'PDF created',
  missingInfo: 'Missing info',
  missingInfoMsg: 'Please enter a title and a date in the format YYYY-MM-DD.',
  optionalDetails: 'Optional details',
  nationalityOptional: 'Nationality (optional)',
  idNumberOptional: 'National ID / Passport number (optional)',
  addressInFranceOptional: 'Address in France (optional)',
  profilePrivacyNote: '🔒 Your profile is saved securely and used to auto-fill letters & documents.',
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
  appSettings: 'App settings',
  notifications: 'Notifications',
  darkMode: 'Dark mode',
  saveChanges: 'Save Changes',
  savedSuccess: 'Saved ✓',
  logout: 'Log out',
  logoutConfirm: 'Are you sure you want to log out?',
  currentPlan: 'Current plan',
  free: 'Free',
  planBasic: 'Basic',
  planPro: 'Pro',
  upgrade: 'Upgrade',
  manageSubscription: 'Manage subscription',
  personalInformation: 'Personal information',
  firstName: 'First name',
  lastName: 'Last name',
  nationality: 'Nationality',
  selectNationality: 'Select nationality',
  addYourNationality: 'Add your nationality',
  cityInFrance: 'City in France',
  phoneOptional: 'Phone number (optional)',
  memberSince: 'Member since',
  yourJourney: 'YOUR JOURNEY',
  noJourneySelected: 'No journey selected yet',
  changeJourney: 'Change Journey',
  startJourney: 'Start a Journey',
  syncingProfile: 'Syncing profile from server…',
  unlimitedDocuments: 'Unlimited documents',
  of: 'of',
  documentsUsedThisMonth: 'documents used this month',
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

const frCore: Dict = {
  appName: 'PrefAI Assistant',
  tagline: 'Votre assistant administratif français',
  continue: 'Continuer',
  skip: 'Passer',
  getStarted: 'Commencer',
  next: 'Suivant',
  back: 'Retour',
  cancel: 'Annuler',
  save: 'Enregistrer',
  delete: 'Supprimer',
  loading: 'Chargement…',
  error: 'Une erreur est survenue',
  retry: 'Réessayer',
  send: 'Envoyer',
  upload: 'Importer un document',
  copy: 'Copier',
  copied: 'Copié !',
  share: 'Partager',
  tabHome: 'Accueil',
  tabJourney: 'Parcours',
  tabDocuments: 'Documents',
  tabAI: 'IA',
  tabChat: 'Chat',
  tabProfile: 'Profil',
  greeting: 'Bonjour',
  goodMorning: 'Bonjour',
  goodAfternoon: 'Bon après-midi',
  goodEvening: 'Bonsoir',
  friend: 'ami',
  homeSubtitle: "Comment puis-je vous aider avec l'administration aujourd'hui ?",
  homeJourneyForward: 'Faisons avancer votre parcours administratif.',
  syncingJourney: 'Synchronisation du parcours…',
  inDays: 'dans',
  days: 'jours',
  continueYourJourney: 'Continuer votre parcours',
  startYourJourney: 'Commencer votre parcours',
  tellUsWhatYouNeed: 'Dites-nous ce que vous voulez faire',
  chooseYourSituation: 'Choisissez votre situation',
  currentStepLabel: 'ÉTAPE ACTUELLE',
  journeyCompleteLabel: 'PARCOURS TERMINÉ 🎉',
  journeyCompleteEveryStep: 'Vous avez terminé toutes les étapes de',
  estimated: 'Estimé',
  todaysTasks: "Tâches d'aujourd'hui",
  checkYourEligibility: 'Vérifier votre éligibilité',
  checkEligibilityDesc: 'Découvrez les aides françaises auxquelles vous pourriez avoir droit',
  quickAiTools: 'Outils IA rapides',
  allTools: 'Tous les outils',
  taskGatherDocs: 'Rassemblez votre passeport et un justificatif de domicile',
  taskValidateVisa: 'Validez votre visa en ligne (si pas encore fait)',
  taskBankAccount: 'Ouvrez ou confirmez votre compte bancaire français',
  whatAreYouTrying: 'Que voulez-vous faire ?',
  pickSituationDesc: 'Choisissez votre situation et nous créerons un parcours étape par étape.',
  change: 'Changer',
  yourProgress: 'Votre progression',
  stepsCompleted: 'étapes terminées',
  tapForDetails: 'Appuyez pour les détails',
  completedCheck: 'Terminé ✓',
  markAsCompleted: 'Marquer comme terminé',
  completedTapUndo: 'Terminé ✓ — appuyez pour annuler',
  aiToolsTitle: 'Outils IA',
  aiToolsSubtitle: 'Aide intelligente pour vos démarches',
  eligibilityChecker: 'Vérificateur d\'éligibilité',
  eligibilityCheckerDesc: 'Vérifiez votre éligibilité aux aides en 10 questions.',
  catAll: 'Tous',
  catPassport: 'Passeport',
  catVisa: 'Visa',
  catCaf: 'CAF',
  catCpam: 'CPAM',
  catContract: 'Contrat',
  catContracts: 'Contrats',
  catTax: 'Impôts',
  catOther: 'Autre',
  vaultEmpty: 'Votre coffre est vide',
  vaultEmptySub: 'Ajoutez passeport, visa, documents CAF et CPAM pour les garder organisés.',
  loadingDocuments: 'Chargement des documents…',
  couldNotOpenPicker: 'Impossible d\'ouvrir le sélecteur de fichiers.',
  removeDocConfirm: 'Retirer ce document du coffre ?',
  couldNotDeleteDoc: 'Impossible de supprimer le document.',
  couldNotReachServer: 'Serveur inaccessible. Document non téléversé.',
  uploadFailed: 'Échec du téléversement. Réessayez.',
  uploadingToServer: 'Téléversement en cours…',
  saveToCategory: 'Enregistrer dans la catégorie',
  fileSelected: 'Sélectionné',
  stepLabel: 'Étape',
  whyThisMatters: 'Pourquoi c\'est important',
  stepByStep: 'Étape par étape',
  whatToBring: 'Documents à apporter',
  findNearYou: 'Trouver près de chez vous',
  askAiAboutStep: 'Demander à l\'IA à propos de cette étape',
  askAiBtn: 'Demander à l\'IA à propos de cette étape',
  openOfficialSite: 'Ouvrir le site officiel',
  aiSomethingWrong: 'Une erreur est survenue. Réessayez.',
  howLongQuestion: 'Combien de temps cela prend-il généralement ?',
  commonMistakesLabel: 'Erreurs courantes',
  whatHappensNext: 'Et ensuite',
  stepNotFound: 'Cette étape est introuvable.',
  completedLabel: 'Terminé',
  eligibilityTitle: 'Vérificateur d\'éligibilité',
  yourResults: 'Vos résultats',
  questionOf: 'Question',
  startThisJourney: 'Commencer ce parcours',
  startOver: 'Recommencer',
  resultsHeading: 'D\'après vos réponses, vous pourriez avoir droit à :',
  eligibilityNoMatch:
    'Nous n\'avons pas pu identifier une aide avec certitude. Cela ne signifie pas que vous n\'êtes pas éligible — vérifiez directement auprès de l\'organisme compétent.',
  onboardingSlide1Title: 'Comprenez toute lettre française',
  onboardingSlide1Body:
    'Importez un document de la CAF, CPAM, Préfecture ou Impôts et obtenez une explication claire dans votre langue.',
  onboardingSlide2Title: 'Répondez et remplissez les formulaires sereinement',
  onboardingSlide2Body:
    'Générez des réponses officielles en français, comprenez chaque champ et ne manquez plus aucune échéance.',
  onboardingSlide3Title: 'Vos documents, organisés et en sécurité',
  onboardingSlide3Body:
    'Stockez passeport, visa et contrats sur votre appareil. PrefAI vous aide — il ne remplace pas les services officiels.',
  required: 'Obligatoire',
  optional: 'Facultatif',
  errFirstNameRequired: 'Le prénom est obligatoire.',
  errLastNameRequired: 'Le nom est obligatoire.',
  errEmailRequired: 'Une adresse e-mail valide est requise.',
  errPasswordMin: 'Le mot de passe doit contenir au moins 6 caractères.',
  errDobIncomplete: 'Complétez les trois champs de date de naissance ou laissez-les vides.',
  errEmailInvalid: 'Entrez une adresse e-mail valide.',
  errRegisterFailed: 'Inscription échouée. Réessayez.',
  errLoginFailed: 'Connexion échouée. Réessayez.',
  idNumber: 'N° ID / passeport',
  address: 'Adresse',
  dateOfBirth: 'Date de naissance',
  passwordMinHint: '(min. 6 caractères)',
  firstNamePlaceholder: 'Prénom',
  lastNamePlaceholder: 'Nom de famille',
  couldNotSaveProfile: 'Impossible d\'enregistrer le profil.',
  userFallback: 'Utilisateur',
  cityPlaceholder: 'ex. Paris',
  editProfile: 'Modifier le profil',
  saveProfile: 'Enregistrer le profil',
  limitReached: 'Limite atteinte',
  limitReachedMsg: 'Vous avez utilisé tous vos documents ce mois-ci. Passez à un plan supérieur.',
  formal: 'Formel',
  polite: 'Poli',
  firm: 'Ferme',
  tone: 'Ton',
  openPdf: 'Ouvrir le PDF',
  openFile: 'Ouvrir le fichier',
  pdfPreviewOpens: 'L\'aperçu PDF s\'ouvre dans le lecteur de votre appareil.',
  filePreviewOpens: 'Ce type de fichier s\'ouvre dans le lecteur de votre appareil.',
  pdfCreated: 'PDF créé',
  missingInfo: 'Informations manquantes',
  missingInfoMsg: 'Entrez un titre et une date au format AAAA-MM-JJ.',
  optionalDetails: 'Informations facultatives',
  nationalityOptional: 'Nationalité (facultatif)',
  idNumberOptional: 'N° ID / passeport (facultatif)',
  addressInFranceOptional: 'Adresse en France (facultatif)',
  profilePrivacyNote: '🔒 Votre profil est enregistré en sécurité et sert à préremplir vos lettres et documents.',
  features: 'Fonctionnalités',
  recentDocuments: 'Documents récents',
  noDocuments: 'Aucun document. Importez-en un pour commencer.',
  quickActions: 'Actions rapides',
  viewAll: 'Tout voir',
  featExplain: 'Expliquer un document',
  featExplainDesc: 'Comprenez toute lettre en langage simple',
  featTranslate: 'Traduire',
  featTranslateDesc: 'Français → votre langue, contexte administratif',
  featReply: 'Réponse IA',
  featReplyDesc: 'Rédigez des réponses officielles en français',
  featForm: 'Aide aux formulaires',
  featFormDesc: 'Que remplir dans chaque champ',
  featDeadlines: 'Échéances',
  featDeadlinesDesc: 'Ne manquez plus une date importante',
  featVault: 'Coffre-fort',
  featVaultDesc: 'Stockez vos documents en sécurité',
  featPdf: 'Lettres PDF',
  featPdfDesc: 'Générez des lettres officielles',
  featGuides: 'Guides',
  featGuidesDesc: 'CAF, CPAM, Préfecture et plus',
  explainTitle: 'Expliquer un document',
  explainUpload: 'Importez un document à expliquer',
  explainAnalyzing: 'Analyse de votre document…',
  summary: 'Résumé',
  keyPoints: 'Points clés',
  deadlines: 'Échéances',
  nextSteps: 'Prochaines étapes',
  translateTitle: 'Traduire',
  translateFrom: 'De',
  translateTo: 'Vers',
  enterText: 'Collez le texte français ici…',
  translateBtn: 'Traduire',
  result: 'Résultat',
  replyTitle: 'Générateur de réponses IA',
  selectOrg: 'Choisir l\'organisme',
  describeSituation: 'Décrivez votre situation…',
  generateReply: 'Générer la réponse',
  formTitle: 'Assistant formulaire',
  formInputLabel: 'Quel formulaire vous pose problème ?',
  explainForm: 'Expliquer le formulaire',
  requiredDocs: 'Documents requis',
  deadlinesTitle: 'Suivi des échéances',
  upcoming: 'À venir',
  noDeadlines: 'Aucune échéance suivie.',
  markDone: 'Marquer fait',
  vaultTitle: 'Coffre-fort',
  vaultSubtitle: 'Vos documents, stockés en sécurité sur cet appareil',
  addDocument: 'Ajouter un document',
  categories: 'Catégories',
  chatTitle: 'Assistant IA',
  chatPlaceholder: 'Posez une question sur l\'administration française…',
  chatWelcome:
    'Bonjour ! Je peux vous aider avec la CAF, la CPAM, la Préfecture, les impôts et plus. Que voulez-vous ?',
  pdfTitle: 'Générateur PDF',
  pdfPurpose: 'Objet de la lettre',
  pdfRecipient: 'Destinataire (ex. CAF de Paris)',
  generatePdf: 'Générer la lettre',
  exportPdf: 'Exporter en PDF',
  guidesTitle: 'Guides',
  profileTitle: 'Profil',
  language: 'Langue',
  subscription: 'Abonnement',
  settings: 'Paramètres',
  appSettings: 'Paramètres de l\'app',
  notifications: 'Notifications',
  darkMode: 'Mode sombre',
  saveChanges: 'Enregistrer',
  savedSuccess: 'Enregistré ✓',
  logout: 'Se déconnecter',
  logoutConfirm: 'Voulez-vous vraiment vous déconnecter ?',
  currentPlan: 'Plan actuel',
  free: 'Gratuit',
  planBasic: 'Basique',
  planPro: 'Pro',
  upgrade: 'Améliorer',
  manageSubscription: 'Gérer l\'abonnement',
  personalInformation: 'Informations personnelles',
  firstName: 'Prénom',
  lastName: 'Nom',
  nationality: 'Nationalité',
  selectNationality: 'Choisir la nationalité',
  addYourNationality: 'Ajoutez votre nationalité',
  cityInFrance: 'Ville en France',
  phoneOptional: 'Téléphone (facultatif)',
  memberSince: 'Membre depuis',
  yourJourney: 'VOTRE PARCOURS',
  noJourneySelected: 'Aucun parcours sélectionné',
  changeJourney: 'Changer de parcours',
  startJourney: 'Commencer un parcours',
  syncingProfile: 'Synchronisation du profil…',
  unlimitedDocuments: 'Documents illimités',
  of: 'sur',
  documentsUsedThisMonth: 'documents utilisés ce mois-ci',
  subscriptionTitle: 'Offres et tarifs',
  choosePlan: 'Choisissez le plan qui vous convient',
  perMonth: '/mois',
  mostPopular: 'POPULAIRE',
  currentPlanLabel: 'Plan actuel',
  selectPlan: 'Choisir',
  login: 'Se connecter',
  register: 'S\'inscrire',
  email: 'E-mail',
  password: 'Mot de passe',
  name: 'Nom complet',
  noAccount: 'Pas de compte ? Inscrivez-vous',
  haveAccount: 'Déjà un compte ? Connectez-vous',
  welcomeBack: 'Bon retour',
  createAccount: 'Créez votre compte',
  documentsThisMonth: 'documents ce mois-ci',
  disclaimer:
    "PrefAI vous aide à comprendre l'administration française. Il ne remplace pas les services officiels.",
};

const es = esLocale as Dict;
const ar = arLocale as Dict;
const ka = kaLocale as Dict;
const bn = bnLocale as Dict;
const zh = zhLocale as Dict;
const hi = hiLocale as Dict;
const pt = ptLocale as Dict;

const ruCore: Dict = {
  appName: 'PrefAI Assistant',
  tagline: 'Ваш помощник по французской бюрократии',
  continue: 'Продолжить',
  skip: 'Пропустить',
  getStarted: 'Начать',
  next: 'Далее',
  back: 'Назад',
  cancel: 'Отмена',
  save: 'Сохранить',
  delete: 'Удалить',
  loading: 'Загрузка…',
  error: 'Что-то пошло не так',
  retry: 'Повторить',
  send: 'Отправить',
  upload: 'Загрузить документ',
  copy: 'Копировать',
  copied: 'Скопировано!',
  share: 'Поделиться',
  tabHome: 'Главная',
  tabJourney: 'Путь',
  tabDocuments: 'Документы',
  tabAI: 'ИИ',
  tabChat: 'Чат',
  tabProfile: 'Профиль',
  greeting: 'Здравствуйте',
  goodMorning: 'Доброе утро',
  goodAfternoon: 'Добрый день',
  goodEvening: 'Добрый вечер',
  friend: 'друг',
  homeSubtitle: 'Чем я могу помочь с французскими формальностями сегодня?',
  homeJourneyForward: 'Давайте продвинем ваш административный путь вперёд.',
  syncingJourney: 'Синхронизация прогресса пути…',
  inDays: 'через',
  days: 'дн.',
  continueYourJourney: 'Продолжить путь',
  startYourJourney: 'Начать путь',
  tellUsWhatYouNeed: 'Расскажите, что вы хотите сделать',
  chooseYourSituation: 'Выберите вашу ситуацию',
  currentStepLabel: 'ТЕКУЩИЙ ШАГ',
  journeyCompleteLabel: 'ПУТЬ ЗАВЕРШЁН 🎉',
  journeyCompleteEveryStep: 'Вы завершили все шаги:',
  estimated: 'Примерно',
  todaysTasks: 'Задачи на сегодня',
  checkYourEligibility: 'Проверить право на помощь',
  checkEligibilityDesc: 'Узнайте, на какие французские пособия вы можете претендовать',
  quickAiTools: 'Быстрые ИИ-инструменты',
  allTools: 'Все инструменты',
  taskGatherDocs: 'Соберите паспорт и подтверждение адреса',
  taskValidateVisa: 'Подтвердите визу онлайн (если ещё не сделано)',
  taskBankAccount: 'Откройте или подтвердите французский банковский счёт',
  whatAreYouTrying: 'Что вы хотите сделать?',
  pickSituationDesc: 'Выберите ситуацию — мы составим пошаговый план.',
  change: 'Сменить',
  yourProgress: 'Ваш прогресс',
  stepsCompleted: 'шагов выполнено',
  tapForDetails: 'Нажмите для подробностей',
  completedCheck: 'Выполнено ✓',
  markAsCompleted: 'Отметить выполненным',
  completedTapUndo: 'Выполнено ✓ — нажмите, чтобы отменить',
  aiToolsTitle: 'ИИ-инструменты',
  aiToolsSubtitle: 'Умная помощь с французскими документами',
  eligibilityChecker: 'Проверка права на помощь',
  eligibilityCheckerDesc: 'Проверьте право на французские пособия за 10 вопросов.',
  catAll: 'Все',
  catPassport: 'Паспорт',
  catVisa: 'Виза',
  catCaf: 'CAF',
  catCpam: 'CPAM',
  catContract: 'Контракт',
  catContracts: 'Контракты',
  catTax: 'Налоги',
  catOther: 'Другое',
  vaultEmpty: 'Хранилище пусто',
  vaultEmptySub: 'Добавьте паспорт, визу, документы CAF и CPAM для удобного хранения.',
  loadingDocuments: 'Загрузка документов с сервера…',
  couldNotOpenPicker: 'Не удалось открыть выбор файла.',
  removeDocConfirm: 'Удалить этот документ из хранилища?',
  couldNotDeleteDoc: 'Не удалось удалить документ.',
  couldNotReachServer: 'Не удалось связаться с сервером. Документ не загружен.',
  uploadFailed: 'Ошибка загрузки. Попробуйте снова.',
  uploadingToServer: 'Загрузка на сервер…',
  saveToCategory: 'Сохранить в категорию',
  fileSelected: 'Выбрано',
  stepLabel: 'Шаг',
  whyThisMatters: 'Зачем это нужно',
  stepByStep: 'Пошагово',
  whatToBring: 'Что взять с собой',
  findNearYou: 'Найти рядом с вами',
  askAiAboutStep: 'Спросить ИИ об этом шаге',
  askAiBtn: 'Спросить ИИ об этом шаге',
  openOfficialSite: 'Открыть официальный сайт',
  aiSomethingWrong: 'Что-то пошло не так. Попробуйте снова.',
  howLongQuestion: 'Сколько времени это обычно занимает?',
  commonMistakesLabel: 'Частые ошибки',
  whatHappensNext: 'Что будет дальше',
  stepNotFound: 'Этот шаг не найден.',
  completedLabel: 'Выполнено',
  eligibilityTitle: 'Проверка права на помощь',
  yourResults: 'Ваши результаты',
  questionOf: 'Вопрос',
  startThisJourney: 'Начать этот путь',
  startOver: 'Начать заново',
  resultsHeading: 'По вашим ответам вы можете претендовать на:',
  eligibilityNoMatch:
    'Мы не смогли точно определить пособие по вашим ответам. Это не означает, что вы не имеете права — уточните напрямую в соответствующем французском органе.',
  onboardingSlide1Title: 'Понимайте любое французское письмо',
  onboardingSlide1Body:
    'Загрузите документ от CAF, CPAM, Préfecture или Impôts и получите понятное объяснение на вашем языке.',
  onboardingSlide2Title: 'Отвечайте и заполняйте формы уверенно',
  onboardingSlide2Body:
    'Создавайте официальные ответы на французском, понимайте каждое поле формы и не пропускайте сроки.',
  onboardingSlide3Title: 'Ваши документы — организованы и в безопасности',
  onboardingSlide3Body:
    'Храните паспорт, визу и контракты на устройстве. PrefAI помогает вам — но не заменяет официальные услуги.',
  required: 'Обязательно',
  optional: 'Необязательно',
  errFirstNameRequired: 'Имя обязательно.',
  errLastNameRequired: 'Фамилия обязательна.',
  errEmailRequired: 'Требуется действительный адрес эл. почты.',
  errPasswordMin: 'Пароль должен содержать не менее 6 символов.',
  errDobIncomplete: 'Заполните все три поля даты рождения или оставьте их пустыми.',
  errEmailInvalid: 'Введите действительный адрес эл. почты.',
  errRegisterFailed: 'Регистрация не удалась. Попробуйте снова.',
  errLoginFailed: 'Вход не удался. Попробуйте снова.',
  idNumber: 'Номер ID / паспорта',
  address: 'Адрес',
  dateOfBirth: 'Дата рождения',
  passwordMinHint: '(мин. 6 символов)',
  firstNamePlaceholder: 'Имя (Prénom)',
  lastNamePlaceholder: 'Фамилия (Nom de famille)',
  couldNotSaveProfile: 'Не удалось сохранить профиль.',
  userFallback: 'Пользователь',
  cityPlaceholder: 'напр. Paris',
  editProfile: 'Редактировать профиль',
  saveProfile: 'Сохранить профиль',
  limitReached: 'Лимит исчерпан',
  limitReachedMsg: 'Вы использовали все документы в этом месяце. Улучшите план, чтобы продолжить.',
  formal: 'Официальный',
  polite: 'Вежливый',
  firm: 'Твёрдый',
  tone: 'Тон',
  openPdf: 'Открыть PDF',
  openFile: 'Открыть файл',
  pdfPreviewOpens: 'Предпросмотр PDF откроется в просмотрщике устройства.',
  filePreviewOpens: 'Этот тип файла откроется в просмотрщике устройства.',
  pdfCreated: 'PDF создан',
  missingInfo: 'Недостаёт информации',
  missingInfoMsg: 'Введите название и дату в формате ГГГГ-ММ-ДД.',
  optionalDetails: 'Дополнительные данные',
  nationalityOptional: 'Гражданство (необязательно)',
  idNumberOptional: 'Номер ID / паспорта (необязательно)',
  addressInFranceOptional: 'Адрес во Франции (необязательно)',
  profilePrivacyNote: '🔒 Ваш профиль сохраняется безопасно и используется для автозаполнения писем и документов.',
  features: 'Функции',
  recentDocuments: 'Недавние документы',
  noDocuments: 'Документов пока нет. Загрузите первый, чтобы начать.',
  quickActions: 'Быстрые действия',
  viewAll: 'Показать все',
  featExplain: 'Объяснение документа',
  featExplainDesc: 'Понятное объяснение любого письма',
  featTranslate: 'Перевод',
  featTranslateDesc: 'С французского на ваш язык с учётом административного контекста',
  featReply: 'ИИ-ответ',
  featReplyDesc: 'Составление официальных ответов на французском',
  featForm: 'Помощь с формами',
  featFormDesc: 'Что писать в каждом поле',
  featDeadlines: 'Сроки',
  featDeadlinesDesc: 'Не пропустите важные даты',
  featVault: 'Хранилище документов',
  featVaultDesc: 'Безопасное хранение ваших бумаг',
  featPdf: 'PDF-письма',
  featPdfDesc: 'Создание официальных писем',
  featGuides: 'Справочники',
  featGuidesDesc: 'CAF, CPAM, префектура и др.',
  explainTitle: 'Объяснение документа',
  explainUpload: 'Загрузите документ для объяснения',
  explainAnalyzing: 'Анализируем ваш документ…',
  summary: 'Краткое содержание',
  keyPoints: 'Ключевые моменты',
  deadlines: 'Сроки',
  nextSteps: 'Следующие шаги',
  translateTitle: 'Перевод',
  translateFrom: 'С',
  translateTo: 'На',
  enterText: 'Вставьте французский текст здесь…',
  translateBtn: 'Перевести',
  result: 'Результат',
  replyTitle: 'Генератор ответов ИИ',
  selectOrg: 'Выберите организацию',
  describeSituation: 'Опишите вашу ситуацию…',
  generateReply: 'Сгенерировать ответ',
  formTitle: 'Помощник с формами',
  formInputLabel: 'С какой формой вам нужна помощь?',
  explainForm: 'Объяснить форму',
  requiredDocs: 'Необходимые документы',
  deadlinesTitle: 'Отслеживание сроков',
  upcoming: 'Предстоящие',
  noDeadlines: 'Сроки пока не добавлены.',
  markDone: 'Отметить выполненным',
  vaultTitle: 'Хранилище документов',
  vaultSubtitle: 'Ваши документы, надёжно хранящиеся на этом устройстве',
  addDocument: 'Добавить документ',
  categories: 'Категории',
  chatTitle: 'ИИ-помощник',
  chatPlaceholder: 'Спросите что угодно о французской бюрократии…',
  chatWelcome:
    'Здравствуйте! Я могу помочь с CAF, CPAM, префектурой, налогами и многим другим. Чем могу помочь?',
  pdfTitle: 'Генератор PDF',
  pdfPurpose: 'Цель письма',
  pdfRecipient: 'Получатель (например, CAF de Paris)',
  generatePdf: 'Создать письмо',
  exportPdf: 'Экспорт в PDF',
  guidesTitle: 'Справочники',
  profileTitle: 'Профиль',
  language: 'Язык',
  subscription: 'Подписка',
  settings: 'Настройки',
  appSettings: 'Настройки приложения',
  notifications: 'Уведомления',
  darkMode: 'Тёмная тема',
  saveChanges: 'Сохранить изменения',
  savedSuccess: 'Сохранено ✓',
  logout: 'Выйти',
  logoutConfirm: 'Вы уверены, что хотите выйти?',
  currentPlan: 'Текущий план',
  free: 'Бесплатный',
  planBasic: 'Базовый',
  planPro: 'Про',
  upgrade: 'Улучшить',
  manageSubscription: 'Управление подпиской',
  personalInformation: 'Личная информация',
  firstName: 'Имя',
  lastName: 'Фамилия',
  nationality: 'Гражданство',
  selectNationality: 'Выберите гражданство',
  addYourNationality: 'Укажите ваше гражданство',
  cityInFrance: 'Город во Франции',
  phoneOptional: 'Номер телефона (необязательно)',
  memberSince: 'Участник с',
  yourJourney: 'ВАШ ПУТЬ',
  noJourneySelected: 'Путь ещё не выбран',
  changeJourney: 'Сменить путь',
  startJourney: 'Начать путь',
  syncingProfile: 'Синхронизация профиля с сервером…',
  unlimitedDocuments: 'Неограниченное количество документов',
  of: 'из',
  documentsUsedThisMonth: 'документов использовано в этом месяце',
  subscriptionTitle: 'Тарифы и цены',
  choosePlan: 'Выберите подходящий план',
  perMonth: '/мес.',
  mostPopular: 'ПОПУЛЯРНЫЙ',
  currentPlanLabel: 'Текущий план',
  selectPlan: 'Выбрать',
  login: 'Войти',
  register: 'Регистрация',
  email: 'Эл. почта',
  password: 'Пароль',
  name: 'Полное имя',
  noAccount: 'Нет аккаунта? Зарегистрируйтесь',
  haveAccount: 'Уже есть аккаунт? Войдите',
  welcomeBack: 'С возвращением',
  createAccount: 'Создайте аккаунт',
  documentsThisMonth: 'документов в этом месяце',
  disclaimer:
    'PrefAI помогает разобраться во французской бюрократии. Он не заменяет официальные государственные услуги.',
};

export const TRANSLATIONS: Record<LanguageCode, Dict> = {
  en: { ...enCore, ...ELIGIBILITY_I18N.en },
  fr: { ...frCore, ...ELIGIBILITY_I18N.fr },
  es: { ...es, ...ELIGIBILITY_I18N.es },
  ru: { ...ruCore, ...ELIGIBILITY_I18N.ru },
  ar: { ...ar, ...ELIGIBILITY_I18N.ar },
  ka: { ...ka, ...ELIGIBILITY_I18N.ka },
  bn: { ...bn, ...ELIGIBILITY_I18N.bn },
  zh: { ...zh, ...ELIGIBILITY_I18N.zh },
  hi: { ...hi, ...ELIGIBILITY_I18N.hi },
  pt: { ...pt, ...ELIGIBILITY_I18N.pt },
};

export const ENGLISH: Record<TranslationKey, string> = {
  ...enCore,
  ...ELIGIBILITY_I18N.en,
} as Record<TranslationKey, string>;
