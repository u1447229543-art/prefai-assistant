import { Ionicons } from '@expo/vector-icons';
import { Colors } from './colors';

/**
 * Administrative Journey Engine data.
 *
 * Each "journey" represents a goal someone living in France is trying to reach
 * (e.g. getting a residence permit). A journey is a sequence of concrete steps,
 * each with a purpose, estimated duration, required documents, where to go, the
 * official organization, plain-language instructions, common mistakes, what
 * happens next and a link to the official source.
 */

export type JourneyId =
  | 'asylum'
  | 'student'
  | 'residence'
  | 'caf'
  | 'health'
  | 'work'
  | 'arrived'
  | 'nationality'
  | 'other';

export interface JourneyStep {
  id: string;
  title: string;
  /** One short sentence: why this step matters. */
  purpose: string;
  /** French original title (optional, curated/static). */
  title_fr?: string;
  /** French original purpose (optional, curated/static). */
  purpose_fr?: string;
  /** Localized titles keyed by language code (en, ka, …). */
  title_i18n?: Partial<Record<string, string>>;
  /** Localized purposes keyed by language code (en, ka, …). */
  purpose_i18n?: Partial<Record<string, string>>;
  /** Human estimate, e.g. "1–2 weeks". */
  duration: string;
  /** Localized duration labels keyed by language code (en, ka, …). */
  duration_i18n?: Partial<Record<string, string>>;
  /** Required documents for this step. */
  documents: string[];
  /** Where to do it (online portal, office...). */
  whereToGo: string;
  /** Official organization. */
  organization: string;
  /** Official government / institution URL. */
  officialUrl: string;
  /** Plain-language numbered instructions. */
  instructions: string[];
  /** 2–3 things people commonly get wrong. */
  commonMistakes: string[];
  /** One sentence: what to expect after completing this step. */
  whatNext: string;
}

/** Localized step title for UI lists — falls back to English `title`. */
export function getStepTitle(step: JourneyStep, lang: string): string {
  return step.title_i18n?.[lang] || step.title_i18n?.en || step.title;
}

/** Localized step purpose for UI lists — falls back to English `purpose`. */
export function getStepPurpose(step: JourneyStep, lang: string): string {
  return step.purpose_i18n?.[lang] || step.purpose_i18n?.en || step.purpose;
}

/** Localized step duration for UI — falls back to English `duration`. */
export function getStepDuration(step: JourneyStep, lang: string): string {
  return step.duration_i18n?.[lang] || step.duration_i18n?.en || step.duration;
}

export interface Journey {
  id: JourneyId;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  steps: JourneyStep[];
}

export const JOURNEYS: Journey[] = [
  {
    id: 'arrived',
    title: 'Just arrived in France',
    subtitle: 'The essential first steps after you land',
    icon: 'airplane-outline',
    accent: Colors.blue,
    steps: [
      {
        id: 'arr-1',
        title: 'Validate your visa (VLS-TS)',
        purpose: 'Most long-stay visas must be validated online within 3 months of arrival, or they become invalid.',
        title_fr: 'Valider votre visa (VLS-TS)',
        purpose_fr:
          'La plupart des visas de long séjour doivent être validés en ligne dans les 3 mois suivant l’arrivée, sinon ils deviennent invalides.',
        title_i18n: {
          en: 'Validate your visa (VLS-TS)',
          ka: 'ვიზის ვალიდაცია (VLS-TS)',
        },
        purpose_i18n: {
          en: 'Most long-stay visas must be validated online within 3 months of arrival, or they become invalid.',
          ka: 'უმეტესი გრძელვადიანი ვიზა ჩამოსვლიდან 3 თვის განმავლობაში უნდა დაადასტუროთ ონლაინ, თორემ ძალას კარგავს.',
        },
        duration: '30 minutes',
        duration_i18n: { en: '30 minutes', ka: '30 წუთი' },

        documents: ['Passport', 'Long-stay visa', 'French address', 'Bank card for the tax stamp'],
        whereToGo: 'Online — anef.administration-etrangers.interieur.gouv.fr',
        organization: 'Ministère de l’Intérieur',
        officialUrl: 'https://anef.administration-etrangers.interieur.gouv.fr/particuliers/#/',
        instructions: [
          'Go to the official ANEF website and choose “Je valide mon visa de long séjour”.',
          'Create an account or log in with your email.',
          'Enter your visa number, date of entry and French address.',
          'Pay the tax stamp (timbre fiscal) online with your bank card.',
          'Download and save the confirmation PDF.',
        ],
        commonMistakes: [
          'Waiting longer than 3 months after arrival.',
          'Entering the wrong date of entry into France.',
          'Forgetting to keep the validation confirmation.',
        ],
        whatNext: 'Your visa now acts as a residence permit for its full duration — keep the confirmation safe.',
      },
      {
        id: 'arr-2',
        title: 'Open a French bank account',
        purpose: 'You need an account (RIB) for rent, salary, CAF and almost every administrative step.',
        title_fr: 'Ouvrir un compte bancaire français',
        purpose_fr:
          'Vous avez besoin d’un compte (RIB) pour le loyer, le salaire, la CAF et presque toutes les démarches administratives.',
        title_i18n: {
          en: 'Open a French bank account',
          ka: 'გახსენით საფრანგეთის საბანკო ანგარიში',
        },
        purpose_i18n: {
          en: 'You need an account (RIB) for rent, salary, CAF and almost every administrative step.',
          ka: 'ანგარიში (RIB) გჭირდებათ ქირის, ხელფასის, CAF-ისა და თითქმის ყველა ადმინისტრაციული ნაბიჯისთვის.',
        },
        duration: '1–2 weeks',
        duration_i18n: { en: '1–2 weeks', ka: '1–2 კვირა' },

        documents: ['Passport / ID', 'Proof of address', 'Visa or residence permit'],
        whereToGo: 'A bank branch or an online bank',
        organization: 'Your chosen bank',
        officialUrl: 'https://www.service-public.fr/particuliers/vosdroits/N99',
        instructions: [
          'Choose a bank (traditional branch or online bank like a neobank).',
          'Book an appointment or sign up online.',
          'Provide your ID, proof of address and visa/permit.',
          'Receive your RIB (bank details) and card by post.',
        ],
        commonMistakes: [
          'Not having a proof of address yet — sort that first.',
          'Choosing a bank with high fees for non-residents.',
        ],
        whatNext: 'You’ll get a RIB you can give to your employer, landlord and CAF.',
      },
      {
        id: 'arr-3',
        title: 'Get proof of address (justificatif de domicile)',
        purpose: 'Almost every French procedure asks for a recent proof that you live somewhere.',
        title_fr: 'Obtenir un justificatif de domicile',
        purpose_fr:
          'Presque toutes les démarches françaises demandent une preuve récente que vous habitez quelque part.',
        title_i18n: {
          en: 'Get proof of address (justificatif de domicile)',
          ka: 'მიიღეთ საცხოვრებლის დამადასტურებელი (justificatif de domicile)',
        },
        purpose_i18n: {
          en: 'Almost every French procedure asks for a recent proof that you live somewhere.',
          ka: 'თითქმის ყველა ფრანგული პროცედურა მოითხოვს ბოლოდროინდელ დამადასტურებელს, რომ სადმე ცხოვრობთ.',
        },
        duration: 'Same day',
        duration_i18n: { en: 'Same day', ka: 'იმავე დღეს' },

        documents: ['Rental contract or hosting attestation', 'Utility bill (electricity, internet)'],
        whereToGo: 'Your landlord / utility provider',
        organization: 'EDF, internet provider, or host',
        officialUrl: 'https://www.service-public.fr/particuliers/vosdroits/F14807',
        instructions: [
          'If you rent: keep your rental contract and a recent utility bill.',
          'If hosted: ask your host for an “attestation d’hébergement” + their ID + a bill.',
          'Make sure the document is less than 3 months old.',
        ],
        commonMistakes: [
          'Using a document older than 3 months.',
          'Forgetting the host’s ID with the hosting attestation.',
        ],
        whatNext: 'You can now complete almost any other administrative step.',
      },
      {
        id: 'arr-4',
        title: 'Register for health insurance',
        purpose: 'Register with Assurance Maladie for reimbursed healthcare (PUMa online or CPAM in person).',
        // NEEDS_REVIEW — exact registration path/timing can vary; wording kept general from source
        title_fr: 'S’inscrire à l’Assurance Maladie',
        // NEEDS_REVIEW
        purpose_fr:
          'Inscrivez-vous à l’Assurance Maladie pour les soins remboursés (PUMa en ligne ou CPAM en présentiel).',
        title_i18n: {
          en: 'Register for health insurance',
          ka: 'დარეგისტრირდით ჯანმრთელობის დაზღვევაზე',
        },
        purpose_i18n: {
          en: 'Register with Assurance Maladie for reimbursed healthcare (PUMa online or CPAM in person).',
          ka: 'დარეგისტრირდით Assurance Maladie-ში ანაზღაურებადი სამედიცინო მომსახურებისთვის (PUMa ონლაინ ან CPAM პირადად).',
        },
        duration: '1–4 months',
        duration_i18n: { en: '1–4 months', ka: '1–4 თვე' },

        documents: ['Passport', 'Visa / residence permit', 'Birth certificate (translated)', 'RIB', 'Proof of address'],
        whereToGo: 'ameli.fr → “Je n’ai pas de numéro de Sécurité sociale”, or your CPAM office',
        organization: 'CPAM / Assurance Maladie',
        officialUrl: 'https://www.ameli.fr',
        instructions: [
          'Go to ameli.fr and choose “Je n’ai pas de numéro de Sécurité sociale”, or visit your CPAM in person.',
          'Gather ID, visa/permit, translated birth certificate, RIB and proof of address.',
          'A temporary number (NIA) usually arrives in 1–4 weeks; attestation downloadable on ameli.fr in 1–2 months.',
          'Order your Carte Vitale from Ameli once registered — physical card in 2–4 months.',
        ],
        commonMistakes: [
          'Sending an untranslated birth certificate.',
          'Forgetting the RIB, which delays reimbursements.',
          'Not downloading the attestation while waiting for the Carte Vitale.',
        ],
        whatNext: 'You’ll have coverage proof (attestation) and can declare a médecin traitant.',
      },
    ],
  },
  {
    id: 'residence',
    title: 'Residence permit',
    subtitle: 'Apply for or renew your titre de séjour',
    icon: 'card-outline',
    accent: Colors.red,
    steps: [
      {
        id: 'res-1',
        title: 'Create your ANEF account',
        purpose: 'All residence-permit applications and renewals are handled online on the ANEF portal.',
        title_fr: 'Créer votre compte ANEF',
        purpose_fr: 'Toutes les demandes et renouvellements de titre de séjour sont gérés en ligne sur le portail ANEF.',
        title_i18n: { en: 'Create your ANEF account', ka: 'შექმენით თქვენი ANEF ანგარიში' },
        purpose_i18n: { en: 'All residence-permit applications and renewals are handled online on the ANEF portal.', ka: 'ყველა ბინადრობის ნებართვის განაცხადი და განახლება ხდება ონლაინ ANEF პორტალზე.' },

        duration: '20 minutes',
        duration_i18n: { en: '20 minutes', ka: '20 წუთი' },

        documents: ['Email address', 'Passport'],
        whereToGo: 'anef.administration-etrangers.interieur.gouv.fr',
        organization: 'ANEF / Préfecture',
        officialUrl: 'https://anef.administration-etrangers.interieur.gouv.fr/particuliers/#/',
        instructions: [
          'Go to anef.administration-etrangers.interieur.gouv.fr (also listed on demarchesetrangers.fr).',
          'Click “Créer un compte” and enter your email and password.',
          'Confirm your email via the link they send you.',
          'Log in and start a new demande or renewal of titre de séjour.',
        ],
        commonMistakes: [
          'Using an email you can’t access later.',
          'Creating several accounts by mistake.',
          'Using outdated portal URLs — always use the ANEF link above.',
        ],
        whatNext: 'You can now prepare and submit your online application.',
      },
      {
        id: 'res-2',
        title: 'Prepare your supporting documents',
        purpose: 'A complete file avoids rejection; renewals must be filed on time with all 2026 requirements.',
        title_fr: 'Préparez vos documents justificatifs',
        purpose_fr: 'Un dossier complet évite le rejet ; les renouvellements doivent être déposés à temps avec toutes les exigences de 2026.',
        title_i18n: { en: 'Prepare your supporting documents', ka: 'მოამზადეთ თქვენი დამადასტურებელი დოკუმენტები' },
        purpose_i18n: { en: 'A complete file avoids rejection; renewals must be filed on time with all 2026 requirements.', ka: 'სრული ფაილი თავიდან აიცილებს უარყოფას; განახლებები უნდა წარდგეს დროულად 2026 წლის ყველა მოთხოვნით.' },

        duration: '1–2 weeks',
        duration_i18n: { en: '1–2 weeks', ka: '1–2 კვირა' },

        documents: [
          'Passport',
          'Proof of address < 6 months',
          'ePhoto code',
          'Proof of resources',
          'Current permit (if renewal)',
          'French language certificate (A2 or B1 — see instructions)',
          'Civic test certificate (test civique)',
        ],
        whereToGo: 'At home — scan everything as PDF',
        organization: 'Préfecture',
        officialUrl: 'https://www.service-public.fr/particuliers/vosdroits/N110',
        instructions: [
          'For renewals: apply between 4 months and 2 months before your permit expires (not 3 months).',
          'Check the document list for your specific permit type on service-public.fr.',
          'Pass the mandatory French test: A2 for carte de séjour pluriannuelle, B1 for carte de résident (2026 rule).',
          'Pass the mandatory civic knowledge test (test civique) and keep your certificate.',
          'Scan each document clearly as a separate PDF and get an ePhoto code from an approved booth.',
        ],
        commonMistakes: [
          'Applying too early (more than 4 months before expiry) or too late (less than 2 months).',
          'Missing the language or civic test certificates required since 2026.',
          'Blurry scans or proof of address older than 6 months.',
        ],
        whatNext: 'With tests passed and documents scanned, you can submit on ANEF.',
      },
      {
        id: 'res-3',
        title: 'Submit the online application',
        purpose: 'This officially starts your request; the préfecture has a 55-day processing target (plan Nuñez, April 2026).',
        // NEEDS_REVIEW
        title_fr: 'Soumettre la demande en ligne',
        // NEEDS_REVIEW
        purpose_fr: 'Cela démarre officiellement votre demande ; la préfecture a un objectif de traitement de 55 jours (plan Nuñez, avril 2026).',
        // NEEDS_REVIEW
        title_i18n: { en: 'Submit the online application', ka: 'გააგზავნეთ ონლაინ განაცხადი' },
        // NEEDS_REVIEW
        purpose_i18n: { en: 'This officially starts your request; the préfecture has a 55-day processing target (plan Nuñez, April 2026).', ka: 'ეს ოფიციალურად იწყებს თქვენს მოთხოვნას; პრეფექტურას აქვს 55-დღიანი დამუშავების მიზანი (plan Nuñez, აპრილი 2026).' },

        duration: '1 hour',
        duration_i18n: { en: '1 hour', ka: '1 საათი' },

        documents: ['Completed ANEF form', 'All scanned documents', 'Language & civic test certificates'],
        whereToGo: 'ANEF online portal',
        organization: 'Préfecture',
        officialUrl: 'https://anef.administration-etrangers.interieur.gouv.fr/particuliers/#/',
        instructions: [
          'Log into ANEF and open your draft application.',
          'Fill every section and upload your PDFs (including test certificates).',
          'Review carefully, then submit.',
          'Save the submission confirmation and note the date — processing target is 55 days.',
        ],
        commonMistakes: [
          'Submitting with a document or test certificate missing.',
          'Typos in passport number or dates.',
          'Assuming silence means approval — see the next steps.',
        ],
        whatNext: 'The préfecture reviews your file and issues a récépissé while processing.',
      },
      {
        id: 'res-4',
        title: 'Get your récépissé',
        purpose: 'A receipt proving your legal stay while the permit is processed (target: 55 days).',
        title_fr: 'Obtenez votre récépissé',
        purpose_fr: 'Un récépissé prouvant votre séjour légal pendant le traitement du titre de séjour (délai cible : 55 jours).',
        title_i18n: { en: 'Get your récépissé', ka: 'მიიღეთ თქვენი რეცეპისი' },
        purpose_i18n: { en: 'A receipt proving your legal stay while the permit is processed (target: 55 days).', ka: 'რეცეპტი, რომელიც ადასტურებს თქვენს ლეგალურ ყოფნას, სანამ ნებართვა მუშავდება (მიზანი: 55 დღე).' },

        duration: '2–4 weeks (récépissé); up to 55 days total processing',
        duration_i18n: { en: '2–4 weeks (récépissé); up to 55 days total processing', ka: '2–4 კვირა (récépissé); 55 დღემდე სრული დამუშავება' },

        documents: ['Application confirmation'],
        whereToGo: 'ANEF account / by post',
        organization: 'Préfecture',
        officialUrl: 'https://anef.administration-etrangers.interieur.gouv.fr/particuliers/#/',
        instructions: [
          'Check your ANEF messages regularly.',
          'Download the récépissé when it appears and print it.',
          'Keep it with your passport at all times.',
          'If you receive no decision after 4 months, this counts as an implicit rejection (not approval) — follow up or appeal.',
        ],
        commonMistakes: [
          'Not checking ANEF notifications.',
          'Letting the récépissé expire without renewing it.',
          'Believing that no answer after 4 months means your permit is approved.',
        ],
        whatNext: 'You can legally stay (and often work) while you wait for the card.',
      },
      {
        id: 'res-5',
        title: 'Collect your residence permit',
        purpose: 'Pick up the physical card once approved and pay the timbre fiscal.',
        title_fr: 'Récupérez votre titre de séjour',
        purpose_fr: 'Retirez la carte physique une fois approuvée et payez le timbre fiscal.',
        title_i18n: { en: 'Collect your residence permit', ka: 'აიღეთ თქვენი ბინადრობის ნებართვა' },
        purpose_i18n: { en: 'Pick up the physical card once approved and pay the fiscal stamp.', ka: 'აიღეთ ფიზიკური ბარათი დამტკიცების შემდეგ და გადაიხადეთ საფინანსო მარკა.' },

        duration: 'Up to 55 days (processing target); card pickup when notified',
        duration_i18n: { en: 'Up to 55 days (processing target); card pickup when notified', ka: '55 დღემდე (დამუშავების მიზანი); ბარათის აღება შეტყობინებისას' },

        documents: ['Récépissé', 'Passport', 'Timbre fiscal (tax stamp)'],
        whereToGo: 'Your local préfecture or as instructed on ANEF',
        organization: 'Préfecture',
        officialUrl: 'https://www.demarchesetrangers.fr',
        instructions: [
          'Wait for the ANEF message saying your card is ready.',
          'Buy the timbre fiscal online: €350 for a first card, €250 for a renewal (rates since 1 May 2026).',
          'Book a pickup appointment if required.',
          'Collect the card in person with your passport and payment proof.',
        ],
        commonMistakes: [
          'Arriving without having paid the correct timbre fiscal amount.',
          'Missing the pickup appointment window.',
          'Using outdated stamp amounts from before May 2026.',
        ],
        whatNext: 'You now hold your residence permit — note its expiry and renew between 4 and 2 months before.',
      },
    ],
  },
  {
    id: 'student',
    title: 'International student',
    subtitle: 'Study, residence and student life setup',
    icon: 'school-outline',
    accent: '#7B61FF',
    steps: [
      {
        id: 'stu-1',
        title: 'Validate your student visa',
        purpose: 'Required within 3 months to stay legally as a student.',
        title_fr: 'Valider votre visa étudiant',
        purpose_fr: 'Nécessaire dans les 3 mois pour séjourner légalement en tant qu\'étudiant.',
        title_i18n: { en: 'Validate your student visa', ka: 'დაადასტურეთ თქვენი სტუდენტური ვიზა' },
        purpose_i18n: { en: 'Required within 3 months to stay legally as a student.', ka: 'საჭიროა 3 თვის განმავლობაში, რომ დარჩეთ ლეგალურად როგორც სტუდენტი.' },

        duration: '30 minutes',
        duration_i18n: { en: '30 minutes', ka: '30 წუთი' },

        documents: ['Passport', 'VLS-TS student visa', 'Address', 'Tax stamp'],
        whereToGo: 'anef.administration-etrangers.interieur.gouv.fr',
        organization: 'Ministère de l’Intérieur',
        officialUrl: 'https://anef.administration-etrangers.interieur.gouv.fr/particuliers/#/',
        instructions: [
          'Open the visa validation portal.',
          'Enter your visa and arrival details.',
          'Pay the tax stamp online.',
          'Save the confirmation.',
        ],
        commonMistakes: ['Missing the 3-month deadline.', 'Wrong arrival date.'],
        whatNext: 'Your visa is now valid as a residence permit for the year.',
      },
      {
        id: 'stu-2',
        title: 'Enrol / confirm your registration',
        purpose: 'Get your student certificate (certificat de scolarité), needed for many steps.',
        title_fr: 'Inscrivez-vous / confirmez votre inscription',
        purpose_fr: 'Obtenez votre certificat de scolarité, nécessaire pour de nombreuses démarches.',
        title_i18n: { en: 'Enroll / Confirm Your Registration', ka: 'დარეგისტრირდით / დაადასტურეთ თქვენი რეგისტრაცია' },
        purpose_i18n: { en: 'Get your student certificate (certificat de scolarité), needed for many procedures.', ka: 'მიიღეთ თქვენი სტუდენტის სერტიფიკატი (certificat de scolarité), რომელიც საჭიროა მრავალი პროცესისთვის.' },

        duration: '1 week',
        duration_i18n: { en: '1 week', ka: '1 კვირა' },

        documents: ['Admission letter', 'Passport', 'Photos'],
        whereToGo: 'Your university registration office',
        organization: 'Your university',
        officialUrl: 'https://www.campusfrance.org/en',
        instructions: [
          'Bring your admission letter and ID to the registration office.',
          'Pay any tuition / CVEC fee if required.',
          'Collect your student card and certificat de scolarité.',
        ],
        commonMistakes: ['Forgetting to pay the CVEC contribution.', 'Missing enrolment deadlines.'],
        whatNext: 'You can use your student certificate for health insurance and CAF.',
      },
      {
        id: 'stu-3',
        title: 'Register with student health insurance',
        purpose: 'Free social security registration for students.',
        title_fr: 'S\'inscrire à l\'assurance maladie étudiante',
        purpose_fr: 'Inscription gratuite à la sécurité sociale pour les étudiants.',
        title_i18n: { en: 'Register with student health insurance', ka: 'დარეგისტრირდით სტუდენტურ ჯანმრთელობის დაზღვევაზე' },
        purpose_i18n: { en: 'Free social security registration for students.', ka: 'უფასო სოციალური დაცვის რეგისტრაცია სტუდენტებისთვის.' },

        duration: '2–4 weeks',
        duration_i18n: { en: '2–4 weeks', ka: '2–4 კვირა' },

        documents: ['Passport', 'Visa', 'Certificat de scolarité', 'RIB'],
        whereToGo: 'etudiant-etranger.ameli.fr',
        organization: 'Assurance Maladie',
        officialUrl: 'https://etudiant-etranger.ameli.fr',
        instructions: [
          'Go to the dedicated student registration site.',
          'Create an account and upload your documents.',
          'Add your RIB for reimbursements.',
          'Wait for your social security number.',
        ],
        commonMistakes: ['Uploading low-quality scans.', 'Forgetting the RIB.'],
        whatNext: 'Once registered, you can order your Carte Vitale.',
      },
      {
        id: 'stu-4',
        title: 'Apply for CAF housing aid',
        purpose: 'Reduce your rent with APL, ALF, or ALS — CAF assigns the most beneficial automatically.',
        title_fr: 'Demander une aide au logement de la CAF',
        purpose_fr: 'Réduisez votre loyer avec l\'APL, l\'ALF ou l\'ALS — la CAF attribue automatiquement la plus avantageuse.',
        title_i18n: { en: 'Apply for CAF housing aid', ka: 'CAF-ის საცხოვრებელი დახმარების განაცხადი' },
        purpose_i18n: { en: 'Reduce your rent with APL, ALF, or ALS — CAF assigns the most beneficial automatically.', ka: 'შეამცირეთ თქვენი ქირა APL, ALF ან ALS-ის დახმარებით — CAF ავტომატურად ანიჭებს ყველაზე სარგებლის მომცემს.' },

        duration: '1 month',
        duration_i18n: { en: '1 month', ka: '1 თვე' },

        documents: ['RIB', 'Rental contract (bail)', 'Passport', 'Birth certificate', 'Social security number'],
        whereToGo: 'caf.fr (online-only; FranceConnect available)',
        organization: 'CAF',
        officialUrl: 'https://www.caf.fr',
        instructions: [
          'Create your account on caf.fr online — no paper Cerfa 10840.',
          'Start a housing aid request; CAF assigns APL, ALF, or ALS automatically.',
          'Enter rent, landlord and income details. In colocation, each tenant applies separately.',
          'Aid is not paid for the first month (mois de carence); payments are normally on the 5th.',
        ],
        commonMistakes: [
          'Expecting aid in the first month of the lease.',
          'One colocataire applying for everyone instead of separate files.',
          'Entering rent or income incorrectly.',
        ],
        whatNext: 'CAF reviews your file; income is recalculated every 3 months.',
      },
    ],
  },
  {
    id: 'caf',
    title: 'CAF benefits',
    subtitle: 'Housing aid (APL, ALF, ALS), family and activity benefits',
    icon: 'home-outline',
    accent: Colors.success,
    steps: [
      {
        id: 'caf-1',
        title: 'Create your CAF account',
        purpose: 'Registration is online-only on caf.fr — the paper Cerfa 10840 is no longer used for most people.',
        title_fr: 'Créer votre compte CAF',
        purpose_fr: 'L\'inscription se fait uniquement en ligne sur caf.fr — le formulaire Cerfa 10840 n\'est plus utilisé pour la plupart des personnes.',
        title_i18n: { en: 'Create your CAF account', ka: 'შექმენით თქვენი CAF ანგარიში' },
        purpose_i18n: { en: 'Registration is online-only on caf.fr — the paper form Cerfa 10840 is no longer used for most people.', ka: 'რეგისტრაცია მხოლოდ ონლაინ რეჟიმშია caf.fr-ზე — ქაღალდის ფორმა Cerfa 10840 აღარ გამოიყენება უმეტესობისთვის.' },

        duration: '20 minutes',
        duration_i18n: { en: '20 minutes', ka: '20 წუთი' },

        documents: ['Passport / residence permit', 'Email', 'RIB'],
        whereToGo: 'caf.fr (FranceConnect login available)',
        organization: 'CAF',
        officialUrl: 'https://www.caf.fr',
        instructions: [
          'Go to caf.fr and choose “Se connecter / S’inscrire”.',
          'You can sign in with FranceConnect or create a CAF account directly.',
          'Register as a new allocataire online — no paper form needed.',
          'Fill in your personal and banking (RIB) details.',
        ],
        commonMistakes: [
          'Trying to submit a paper Cerfa 10840 — registration is online-only.',
          'Using inconsistent name spelling vs your ID.',
          'Skipping the RIB.',
        ],
        whatNext: 'You get an allocataire number to manage your benefits online.',
      },
      {
        id: 'caf-2',
        title: 'Get your social security number',
        purpose: 'CAF needs your numéro de Sécurité sociale to process your file.',
        title_fr: 'Obtenez votre numéro de sécurité sociale',
        purpose_fr: 'La CAF a besoin de votre numéro de Sécurité sociale pour traiter votre dossier.',
        title_i18n: { en: 'Obtain your social security number', ka: 'მიიღეთ თქვენი სოციალური დაცვის ნომერი' },
        purpose_i18n: { en: 'CAF requires your social security number to process your file.', ka: 'CAF-ს სჭირდება თქვენი სოციალური დაცვის ნომერი თქვენი საქმის დასამუშავებლად.' },

        duration: '2–6 weeks',
        duration_i18n: { en: '2–6 weeks', ka: '2–6 კვირა' },

        documents: ['Birth certificate (translated)', 'Passport', 'Visa / permit'],
        whereToGo: 'ameli.fr or your local CPAM',
        organization: 'CPAM',
        officialUrl: 'https://www.ameli.fr',
        instructions: [
          'Register with CPAM if you haven’t already (online at ameli.fr or in person).',
          'Provide your translated birth certificate.',
          'Wait for your permanent social security number.',
          'Add it to your CAF profile on caf.fr.',
        ],
        commonMistakes: ['Untranslated birth certificate.', 'Not following up with CPAM if delayed.'],
        whatNext: 'With the number added, CAF can finalise your housing aid file.',
      },
      {
        id: 'caf-3',
        title: 'Submit your housing aid request',
        purpose: 'CAF assigns the most beneficial aid: APL, ALF, or ALS — you do not choose.',
        title_fr: 'Soumettre votre demande d\'aide au logement',
        purpose_fr: 'La CAF attribue l\'aide la plus avantageuse : APL, ALF ou ALS — vous ne choisissez pas.',
        title_i18n: { en: 'Submit your housing aid request', ka: 'გააგზავნეთ თქვენი საცხოვრებლის დახმარების მოთხოვნა' },
        purpose_i18n: { en: 'CAF assigns the most beneficial aid: APL, ALF, or ALS — you do not choose.', ka: 'CAF განსაზღვრავს ყველაზე სასარგებლო დახმარებას: APL, ALF ან ALS — თქვენ არ ირჩევთ.' },

        duration: '1 hour',
        duration_i18n: { en: '1 hour', ka: '1 საათი' },

        documents: ['RIB', 'Rental contract (bail)', 'Income details', 'Landlord details'],
        whereToGo: 'caf.fr — “Mon Compte”',
        organization: 'CAF',
        officialUrl: 'https://www.caf.fr',
        instructions: [
          'Log into your CAF account and start a housing aid request.',
          'Enter your rent, landlord, household and income details.',
          'CAF automatically assigns APL, ALF, or ALS — whichever is most beneficial.',
          'In shared housing (colocation), each tenant must apply separately with their own file.',
          'Note: the first month of rental never receives aid (mois de carence).',
        ],
        commonMistakes: [
          'Expecting payment in the first month of your lease.',
          'One person applying for the whole colocation instead of each tenant filing separately.',
          'Under/over-declaring income or rent.',
        ],
        whatNext: 'CAF reviews your file; payments start from the eligible month (not month one).',
      },
      {
        id: 'caf-4',
        title: 'Track payments and updates',
        purpose: 'Aid is recalculated every 3 months; rising income reduces your payment.',
        title_fr: 'Suivre les paiements et mises à jour',
        purpose_fr: 'L\'aide est recalculée tous les 3 mois ; une augmentation de revenu réduit votre paiement.',
        title_i18n: { en: 'Track payments and updates', ka: 'გადახდებისა და განახლებების მონიტორინგი' },
        purpose_i18n: { en: 'Aid is recalculated every 3 months; rising income reduces your payment.', ka: 'დახმარება გადათვლილია ყოველ 3 თვეში; შემოსავლის ზრდა ამცირებს თქვენს გადახდას.' },

        duration: 'Ongoing',
        duration_i18n: { en: 'Ongoing', ka: 'მიმდინარე' },

        documents: ['CAF account access'],
        whereToGo: 'caf.fr',
        organization: 'CAF',
        officialUrl: 'https://www.caf.fr',
        instructions: [
          'Housing aid is normally paid on the 5th of each month.',
          '2026 payment exceptions: 7 April, 6 July, 4 September, 4 December.',
          'Your income is recalculated automatically every 3 months — not once a year.',
          'Report moves, job changes or family changes promptly on caf.fr.',
        ],
        commonMistakes: [
          'Not reporting a pay rise — CAF will catch up and you may owe money back.',
          'Expecting the same payment date every month in 2026 (check the exceptions).',
          'Forgetting to update your situation after a move or colocation change.',
        ],
        whatNext: 'Your benefits stay accurate and payments continue on schedule.',
      },
    ],
  },
  {
    id: 'health',
    title: 'Health insurance',
    subtitle: 'Get covered with Assurance Maladie',
    icon: 'medkit-outline',
    accent: '#00E0B8',
    steps: [
      {
        id: 'hea-1',
        title: 'Register for health coverage',
        purpose: 'Choose the right path: employee DPAE, PUMa online, student portal, or AME if you have no titre de séjour.',
        title_fr: 'S\'inscrire à la couverture santé',
        purpose_fr: 'Choisissez la bonne voie : DPAE pour les salariés, PUMa en ligne, portail étudiant, ou AME si vous n\'avez pas de titre de séjour.',
        title_i18n: { en: 'Register for health coverage', ka: 'დარეგისტრირდით ჯანმრთელობის დაზღვევაზე' },
        purpose_i18n: { en: 'Choose the right path: employee DPAE, PUMa online, student portal, or AME if you have no residence permit.', ka: 'აირჩიეთ სწორი გზა: თანამშრომლის DPAE, PUMa ონლაინ, სტუდენტური პორტალი, ან AME თუ არ გაქვთ ბინადრობის ნებართვა.' },

        duration: '1 hour',
        duration_i18n: { en: '1 hour', ka: '1 საათი' },

        documents: ['Passport', 'Visa / permit (if applicable)', 'Birth certificate (translated)', 'Proof of address', 'RIB'],
        whereToGo: 'ameli.fr, etudiant-etranger.ameli.fr, or your CPAM office',
        organization: 'CPAM / Assurance Maladie',
        officialUrl: 'https://www.ameli.fr',
        instructions: [
          'Employees: your employer files the DPAE — registration with CPAM is usually automatic.',
          'Everyone else (PUMa): go to ameli.fr → “Je n’ai pas de numéro de Sécurité sociale”, or visit your CPAM in person.',
          'Students: use the separate portal at etudiant-etranger.ameli.fr (not the standard PUMa form).',
          'Without a titre de séjour: after 3 months in France you may apply for AME (Aide Médicale de l’État).',
        ],
        commonMistakes: [
          'Students using the standard PUMa form instead of etudiant-etranger.ameli.fr.',
          'Employees re-applying manually when the employer DPAE should handle it.',
          'Applying for PUMa before 3 months of stable residence (AME path if undocumented).',
        ],
        whatNext: 'CPAM opens your file and issues a temporary number (NIA) first.',
      },
      {
        id: 'hea-2',
        title: 'Receive your social security number',
        purpose: 'You get a temporary NIA first, then your permanent numéro de Sécurité sociale.',
        title_fr: 'Recevez votre numéro de sécurité sociale',
        purpose_fr: 'Vous recevez d\'abord un NIA temporaire, puis votre numéro de Sécurité sociale permanent.',
        title_i18n: { en: 'Receive your social security number', ka: 'მიიღეთ თქვენი სოციალური დაცვის ნომერი' },
        purpose_i18n: { en: 'You first receive a temporary NIA, then your permanent social security number.', ka: 'თავდაპირველად მიიღებთ დროებით NIA-ს, შემდეგ კი თქვენს მუდმივ სოციალური დაცვის ნომერს.' },

        duration: 'NIA in 1–4 weeks; attestation on ameli.fr in 1–2 months',
        duration_i18n: { en: 'NIA in 1–4 weeks; attestation on ameli.fr in 1–2 months', ka: 'NIA 1–4 კვირაში; დადასტურება ameli.fr-ზე 1–2 თვეში' },

        documents: ['Submitted registration file'],
        whereToGo: 'By post / your ameli.fr account',
        organization: 'CPAM',
        officialUrl: 'https://www.ameli.fr',
        instructions: [
          'A temporary number (NIA) usually arrives within 1–4 weeks.',
          'Your permanent numéro de Sécurité sociale follows by post.',
          'Download your attestation de droits on ameli.fr within 1–2 months — use it until your Carte Vitale arrives.',
          'If delayed, contact your CPAM by phone or secure message.',
        ],
        commonMistakes: [
          'Not downloading the attestation while waiting for the physical card.',
          'Losing the letter with your permanent number.',
        ],
        whatNext: 'You can create your Ameli account and request your Carte Vitale.',
      },
      {
        id: 'hea-3',
        title: 'Create your Ameli account',
        purpose: 'Manage reimbursements, attestation and Carte Vitale requests online.',
        title_fr: 'Créer votre compte Ameli',
        purpose_fr: 'Gérer les remboursements, les attestations et les demandes de Carte Vitale en ligne.',
        title_i18n: { en: 'Create your Ameli account', ka: 'შექმენით თქვენი Ameli ანგარიში' },
        purpose_i18n: { en: 'Manage reimbursements, certificates, and Carte Vitale requests online.', ka: 'მართეთ ანაზღაურებები, სერტიფიკატები და Carte Vitale-ის მოთხოვნები ონლაინ.' },

        duration: '20 minutes',
        duration_i18n: { en: '20 minutes', ka: '20 წუთი' },

        documents: ['Social security number (or NIA)', 'RIB'],
        whereToGo: 'ameli.fr',
        organization: 'Assurance Maladie',
        officialUrl: 'https://www.ameli.fr',
        instructions: [
          'Go to ameli.fr and click “Créer mon compte”.',
          'Enter your social security number or NIA.',
          'Add your RIB so reimbursements are paid directly to your bank.',
        ],
        commonMistakes: [
          'Entering the wrong social security number.',
          'Forgetting to add the RIB — reimbursements will be delayed.',
        ],
        whatNext: 'Request your Carte Vitale from your Ameli account.',
      },
      {
        id: 'hea-4',
        title: 'Order your Carte Vitale',
        purpose: 'The physical card makes reimbursements automatic at doctors and pharmacies.',
        title_fr: 'Commander votre Carte Vitale',
        purpose_fr: 'La carte physique rend les remboursements automatiques chez les médecins et les pharmacies.',
        title_i18n: { en: 'Order your Carte Vitale', ka: 'შეუკვეთეთ თქვენი Carte Vitale' },
        purpose_i18n: { en: 'The physical card makes reimbursements automatic at doctors and pharmacies.', ka: 'ფიზიკური ბარათი ავტომატურად ახდენს ანაზღაურებას ექიმებთან და აფთიაქებში.' },

        duration: '2–4 months for the physical card',
        duration_i18n: { en: '2–4 months for the physical card', ka: '2–4 თვე ფიზიკური ბარათისთვის' },

        documents: ['ID photo (e-photo code)', 'ID document'],
        whereToGo: 'Your ameli.fr account',
        organization: 'Assurance Maladie',
        officialUrl: 'https://www.ameli.fr',
        instructions: [
          'In your Ameli account, request the Carte Vitale.',
          'Upload a compliant e-photo and your ID.',
          'Use your attestation de droits (downloadable on ameli.fr) while you wait.',
          'The physical Carte Vitale usually arrives by post in 2–4 months.',
        ],
        commonMistakes: [
          'Non-compliant photo format.',
          'Not using the attestation during the waiting period.',
        ],
        whatNext: 'Present your Carte Vitale (or attestation) at any healthcare visit.',
      },
      {
        id: 'hea-5',
        title: 'Choose a médecin traitant',
        purpose: 'Declaring a GP (médecin traitant) gives you the best reimbursement rate.',
        title_fr: 'Choisir un médecin traitant',
        purpose_fr: 'Déclarer un médecin traitant vous permet d\'obtenir le meilleur taux de remboursement.',
        title_i18n: { en: 'Choose a GP (médecin traitant)', ka: 'აირჩიეთ ექიმი (médecin traitant)' },
        purpose_i18n: { en: 'Declaring a GP (médecin traitant) gives you the best reimbursement rate.', ka: 'ექიმის (médecin traitant) დეკლარირება გაძლევთ საუკეთესო ანაზღაურების კურსს.' },

        duration: 'Same day',
        duration_i18n: { en: 'Same day', ka: 'იმავე დღეს' },

        documents: ['Carte Vitale or attestation de droits'],
        whereToGo: 'Your chosen doctor’s office',
        organization: 'Assurance Maladie',
        officialUrl: 'https://www.ameli.fr',
        instructions: [
          'Find a généraliste (GP) accepting new patients.',
          'Ask them to declare you as their “médecin traitant”.',
          'They register it online with your Carte Vitale or attestation.',
          'Low income? Apply for CSS (Complémentaire Santé Solidaire) on ameli.fr — free or near-free mutuelle cover.',
        ],
        commonMistakes: [
          'Skipping médecin traitant declaration and getting reimbursed less.',
          'Not applying for CSS when on a low income.',
        ],
        whatNext: 'Your healthcare costs are reimbursed at the best rate; CSS covers what CPAM does not if eligible.',
      },
    ],
  },
  {
    id: 'work',
    title: 'Looking for work',
    subtitle: 'Right to work, registration and job search',
    icon: 'briefcase-outline',
    accent: Colors.warning,
    steps: [
      {
        id: 'wrk-1',
        title: 'Check your right to work',
        purpose: 'Confirm your residence permit or visa actually allows employment.',
        title_fr: 'Vérifiez votre droit au travail',
        purpose_fr: 'Confirmez que votre titre de séjour ou visa vous autorise effectivement à travailler.',
        title_i18n: { en: 'Check your right to work', ka: 'შეამოწმეთ თქვენი სამუშაოს უფლება' },
        purpose_i18n: { en: 'Confirm that your residence permit or visa actually allows you to work.', ka: 'დაადასტურეთ, რომ თქვენი ბინადრობის ნებართვა ან ვიზა რეალურად გაძლევთ მუშაობის უფლებას.' },

        duration: '30 minutes',
        duration_i18n: { en: '30 minutes', ka: '30 წუთი' },

        documents: ['Residence permit / visa'],
        whereToGo: 'Check your permit category online',
        organization: 'Préfecture',
        officialUrl: 'https://www.service-public.fr/particuliers/vosdroits/F2728',
        instructions: [
          'Look at the mention on your permit (e.g. “autorise à travailler”).',
          'Check the rules for your permit type.',
          'If unsure, ask the AI assistant below.',
        ],
        commonMistakes: ['Assuming all permits allow full-time work.', 'Ignoring student work-hour limits.'],
        whatNext: 'You know whether you can work and for how many hours.',
      },
      {
        id: 'wrk-2',
        title: 'Register with France Travail',
        purpose: 'Access job offers, advice and possible unemployment support.',
        title_fr: 'S\'inscrire à France Travail',
        purpose_fr: 'Accéder aux offres d\'emploi, aux conseils et à un éventuel soutien au chômage.',
        title_i18n: { en: 'Register with France Travail', ka: 'რეგისტრაცია France Travail-ში' },
        purpose_i18n: { en: 'Access job offers, advice, and possible unemployment support.', ka: 'მიიღეთ წვდომა სამუშაო შეთავაზებებზე, რჩევებზე და შესაძლო უმუშევრობის დახმარებაზე.' },

        duration: '1 week',
        duration_i18n: { en: '1 week', ka: '1 კვირა' },

        documents: ['ID', 'Residence permit', 'RIB', 'CV'],
        whereToGo: 'francetravail.fr',
        organization: 'France Travail (ex Pôle emploi)',
        officialUrl: 'https://www.francetravail.fr',
        instructions: [
          'Create an account on francetravail.fr.',
          'Complete your profile and upload your CV.',
          'Attend your first appointment if scheduled.',
        ],
        commonMistakes: ['Incomplete profile.', 'Missing the first appointment.'],
        whatNext: 'You’ll receive tailored job offers and support.',
      },
      {
        id: 'wrk-3',
        title: 'Prepare a French CV & lettre de motivation',
        purpose: 'French applications follow a specific, expected format.',
        title_fr: 'Préparer un CV français et une lettre de motivation',
        purpose_fr: 'Les candidatures françaises suivent un format spécifique et attendu.',
        title_i18n: { en: 'Prepare a French CV & cover letter', ka: 'მოამზადეთ ფრანგული CV და სამოტივაციო წერილი' },
        purpose_i18n: { en: 'French applications follow a specific, expected format.', ka: 'ფრანგული განაცხადები მიჰყვება კონკრეტულ, მოსალოდნელ ფორმატს.' },

        duration: '2–3 days',
        duration_i18n: { en: '2–3 days', ka: '2–3 დღე' },

        documents: ['Work history', 'Diplomas'],
        whereToGo: 'At home — use the AI tools',
        organization: 'PrefAI',
        officialUrl: 'https://www.francetravail.fr',
        instructions: [
          'List your experience and education.',
          'Use the AI Reply / Translate tools to draft in French.',
          'Keep the CV to one page where possible.',
        ],
        commonMistakes: ['Direct translation that sounds unnatural.', 'Too long, unfocused CV.'],
        whatNext: 'You have ready-to-send French application documents.',
      },
      {
        id: 'wrk-4',
        title: 'Get your social security & RIB ready',
        purpose: 'Employers need these to hire and pay you.',
        title_fr: 'Préparez votre sécurité sociale et RIB',
        purpose_fr: 'Les employeurs ont besoin de ces documents pour vous embaucher et vous payer.',
        title_i18n: { en: 'Prepare your social security and bank details', ka: 'მოამზადეთ თქვენი სოციალური დაცვა და საბანკო რეკვიზიტები' },
        purpose_i18n: { en: 'Employers need these documents to hire and pay you.', ka: 'დასაქმებულებს ეს დოკუმენტები სჭირდებათ თქვენი დასაქმებისა და გადახდისთვის.' },

        duration: '1–4 weeks',
        duration_i18n: { en: '1–4 weeks', ka: '1–4 კვირა' },

        documents: ['Social security number', 'Bank RIB'],
        whereToGo: 'CPAM + your bank',
        organization: 'CPAM',
        officialUrl: 'https://www.ameli.fr',
        instructions: [
          'Make sure you have a social security number.',
          'Download your RIB from your bank app.',
          'Keep both ready to share with employers.',
        ],
        commonMistakes: ['Starting a job without a social security number.'],
        whatNext: 'You’re ready to sign a contract and get paid correctly.',
      },
    ],
  },
  {
    id: 'asylum',
    title: 'Asylum seeker',
    subtitle: 'Request international protection in France',
    icon: 'shield-outline',
    accent: Colors.blue,
    steps: [
      {
        id: 'asy-1',
        title: 'Go to a first-reception office (SPADA)',
        purpose: 'The SPADA is your entry point to register an asylum claim.',
        title_fr: 'Aller à un bureau d\'accueil (SPADA)',
        purpose_fr: 'La SPADA est votre point d\'entrée pour enregistrer une demande d\'asile.',
        title_i18n: { en: 'Visit a first-reception office (SPADA)', ka: 'ეწვიეთ პირველადი მიღების ოფისს (SPADA)' },
        purpose_i18n: { en: 'The SPADA is your entry point to register an asylum claim.', ka: 'SPADA არის თქვენი შესვლის წერტილი თავშესაფრის მოთხოვნის რეგისტრაციისთვის.' },

        duration: '1–3 weeks',
        duration_i18n: { en: '1–3 weeks', ka: '1–3 კვირა' },

        documents: ['ID if available', 'Any travel documents'],
        whereToGo: 'Your local SPADA platform',
        organization: 'OFII / SPADA',
        officialUrl: 'https://www.ofii.fr',
        instructions: [
          'Find the SPADA covering your region.',
          'Go in person to state you want to seek asylum.',
          'They register your details and book a GUDA appointment.',
        ],
        commonMistakes: ['Going to the wrong office.', 'Not keeping the appointment paper safe.'],
        whatNext: 'You receive an appointment at the single desk (GUDA).',
      },
      {
        id: 'asy-2',
        title: 'Register at the GUDA',
        purpose: 'Official registration of your asylum request and fingerprinting.',
        title_fr: 'Enregistrement au GUDA',
        purpose_fr: 'Enregistrement officiel de votre demande d\'asile et prise d\'empreintes digitales.',
        title_i18n: { en: 'Register at the GUDA', ka: 'რეგისტრაცია GUDA-ში' },
        purpose_i18n: { en: 'Official registration of your asylum request and fingerprinting.', ka: 'თქვენი თავშესაფრის მოთხოვნის ოფიციალური რეგისტრაცია და თითის ანაბეჭდების აღება.' },

        duration: '1 day',
        duration_i18n: { en: '1 day', ka: '1 დღე' },

        documents: ['SPADA appointment', 'Photos'],
        whereToGo: 'Guichet unique (GUDA)',
        organization: 'Préfecture + OFII',
        officialUrl: 'https://www.ofii.fr',
        instructions: [
          'Attend your GUDA appointment on time.',
          'Give fingerprints and personal details.',
          'Receive your asylum-seeker certificate (attestation).',
        ],
        commonMistakes: ['Arriving late or missing the appointment.', 'Incomplete personal information.'],
        whatNext: 'You get the attestation de demande d’asile and OFII reception conditions.',
      },
      {
        id: 'asy-3',
        title: 'Receive your asylum-seeker certificate',
        purpose: 'Proof of your right to remain in France during the procedure.',
        title_fr: 'Recevez votre attestation de demandeur d\'asile',
        purpose_fr: 'Preuve de votre droit de rester en France pendant la procédure.',
        title_i18n: { en: 'Receive your asylum-seeker certificate', ka: 'მიიღეთ თავშესაფრის მაძიებლის სერტიფიკატი' },
        purpose_i18n: { en: 'Proof of your right to remain in France during the procedure.', ka: 'საფრანგეთში დარჩენის უფლების დამადასტურებელი დოკუმენტი პროცედურის განმავლობაში.' },

        duration: 'Same day',
        duration_i18n: { en: 'Same day', ka: 'იმავე დღეს' },

        documents: ['GUDA registration'],
        whereToGo: 'GUDA',
        organization: 'Préfecture',
        officialUrl: 'https://www.ofpra.gouv.fr',
        instructions: [
          'Keep the attestation safe — it proves your legal stay.',
          'Note its validity and renewal dates.',
        ],
        commonMistakes: ['Letting it expire without renewing.'],
        whatNext: 'You can now prepare and send your OFPRA application.',
      },
      {
        id: 'asy-4',
        title: 'Submit your OFPRA application',
        purpose: 'Your detailed asylum account, due within 21 days of registration.',
        title_fr: 'Soumettre votre demande OFPRA',
        purpose_fr: 'Votre récit détaillé d\'asile, à soumettre dans les 21 jours suivant l\'enregistrement.',
        title_i18n: { en: 'Submit your OFPRA application', ka: 'გააგზავნეთ თქვენი OFPRA განაცხადი' },
        purpose_i18n: { en: 'Your detailed asylum account, due within 21 days of registration.', ka: 'თქვენი დეტალური თავშესაფრის ანგარიში, რომელიც უნდა წარადგინოთ რეგისტრაციიდან 21 დღის განმავლობაში.' },

        duration: '1–3 weeks',
        duration_i18n: { en: '1–3 weeks', ka: '1–3 კვირა' },

        documents: ['Attestation de demande d’asile', 'Written account of your story'],
        whereToGo: 'By post to OFPRA',
        organization: 'OFPRA',
        officialUrl: 'https://www.ofpra.gouv.fr',
        instructions: [
          'Write your personal account clearly and honestly.',
          'Complete the OFPRA form you received.',
          'Send it by registered post before the deadline.',
        ],
        commonMistakes: ['Missing the 21-day deadline.', 'Vague or inconsistent account.'],
        whatNext: 'OFPRA reviews your file and calls you to an interview.',
      },
      {
        id: 'asy-5',
        title: 'Attend your OFPRA interview',
        purpose: 'The decisive step where you explain your situation in person.',
        title_fr: 'Assister à votre entretien OFPRA',
        purpose_fr: 'L\'étape décisive où vous expliquez votre situation en personne.',
        title_i18n: { en: 'Attend your OFPRA interview', ka: 'დასწრებით OFPRA-ს ინტერვიუზე' },
        purpose_i18n: { en: 'The decisive step where you explain your situation in person.', ka: 'გადამწყვეტი ნაბიჯი, სადაც პირადად განმარტავთ თქვენს მდგომარეობას.' },

        duration: '1–12 months',
        duration_i18n: { en: '1–12 months', ka: '1–12 თვე' },

        documents: ['Convocation letter', 'Supporting evidence'],
        whereToGo: 'OFPRA (Fontenay-sous-Bois) or by video',
        organization: 'OFPRA',
        officialUrl: 'https://www.ofpra.gouv.fr',
        instructions: [
          'Bring your convocation and any evidence.',
          'Request an interpreter if needed.',
          'Explain your story clearly and consistently.',
        ],
        commonMistakes: ['Not requesting an interpreter.', 'Forgetting key evidence.'],
        whatNext: 'OFPRA sends a written decision; if refused, you can appeal to the CNDA.',
      },
    ],
  },
  {
    id: 'nationality',
    title: 'French nationality',
    subtitle: 'Apply for naturalisation',
    icon: 'flag-outline',
    accent: Colors.red,
    steps: [
      {
        id: 'nat-1',
        title: 'Check you meet the conditions',
        purpose: 'Usually 5 years of residence, stable income and integration are required.',
        title_fr: 'Vérifiez que vous remplissez les conditions',
        purpose_fr: 'En général, 5 ans de résidence, un revenu stable et une intégration sont requis.',
        title_i18n: { en: 'Check if you meet the conditions', ka: 'შეამოწმეთ, აკმაყოფილებთ თუ არა პირობებს' },
        purpose_i18n: { en: 'Usually, 5 years of residence, stable income, and integration are required.', ka: 'ჩვეულებრივ, საჭიროა 5 წლიანი რეზიდენცია, სტაბილური შემოსავალი და ინტეგრაცია.' },

        duration: '1 hour',
        duration_i18n: { en: '1 hour', ka: '1 საათი' },

        documents: ['Residence history', 'Income proof'],
        whereToGo: 'Read criteria on service-public.fr',
        organization: 'Ministère de l’Intérieur',
        officialUrl: 'https://www.service-public.fr/particuliers/vosdroits/N111',
        instructions: [
          'Read the naturalisation conditions.',
          'Check your years of residence and income stability.',
          'Note any exceptions that apply to you.',
        ],
        commonMistakes: ['Applying before meeting the residence requirement.'],
        whatNext: 'You know whether you’re eligible to apply now or later.',
      },
      {
        id: 'nat-2',
        title: 'Pass a French language test (B1)',
        purpose: 'Proof of at least B1 spoken and written French is required.',
        title_fr: 'Passer un test de langue française (B1)',
        purpose_fr: 'Une preuve d\'un niveau de français parlé et écrit d\'au moins B1 est requise.',
        title_i18n: { en: 'Pass a French language test (B1)', ka: 'ფრანგული ენის ტესტის ჩაბარება (B1)' },
        purpose_i18n: { en: 'Proof of at least B1 spoken and written French is required.', ka: 'მინიმუმ B1 დონის ფრანგული ენის საუბრისა და წერილობითი ცოდნის დამადასტურებელი საბუთი აუცილებელია.' },

        duration: '1–2 months',
        duration_i18n: { en: '1–2 months', ka: '1–2 თვე' },

        documents: ['ID', 'Test registration'],
        whereToGo: 'An approved test centre (TCF/DELF)',
        organization: 'Approved language centre',
        officialUrl: 'https://www.france-education-international.fr',
        instructions: [
          'Choose an approved test (TCF Intégration or DELF B1+).',
          'Register and pay for a session.',
          'Take the test and keep your certificate.',
        ],
        commonMistakes: ['Taking a non-approved test.', 'Forgetting the certificate is required in the file.'],
        whatNext: 'Your language certificate goes into your naturalisation file.',
      },
      {
        id: 'nat-3',
        title: 'Build your naturalisation file',
        purpose: 'A thorough, well-organised file is essential to avoid rejection.',
        title_fr: 'Constituer votre dossier de naturalisation',
        purpose_fr: 'Un dossier complet et bien organisé est essentiel pour éviter un rejet.',
        title_i18n: { en: 'Build your naturalization file', ka: 'შექმენით თქვენი ნატურალიზაციის ფაილი' },
        purpose_i18n: { en: 'A thorough, well-organized file is essential to avoid rejection.', ka: 'სრული და კარგად ორგანიზებული ფაილი აუცილებელია უარის თავიდან ასაცილებლად.' },

        duration: '2–4 weeks',
        duration_i18n: { en: '2–4 weeks', ka: '2–4 კვირა' },

        documents: ['Birth certificate (translated)', 'Tax notices', 'Payslips', 'Residence permits', 'Language certificate'],
        whereToGo: 'At home — scan as PDF',
        organization: 'Préfecture',
        officialUrl: 'https://www.service-public.fr/particuliers/vosdroits/N111',
        instructions: [
          'Collect civil-status, tax and income documents.',
          'Get official translations where required.',
          'Scan everything clearly and organise by category.',
        ],
        commonMistakes: ['Missing tax notices.', 'Non-official translations.'],
        whatNext: 'With a complete file, you can submit your application.',
      },
      {
        id: 'nat-4',
        title: 'Submit your application',
        purpose: 'Officially lodge your naturalisation request.',
        title_fr: 'Soumettre votre demande',
        purpose_fr: 'Déposer officiellement votre demande de naturalisation.',
        title_i18n: { en: 'Submit your application', ka: 'გააგზავნეთ თქვენი განაცხადი' },
        purpose_i18n: { en: 'Officially lodge your naturalisation request.', ka: 'ოფიციალურად წარადგინეთ თქვენი ნატურალიზაციის მოთხოვნა.' },

        duration: '1 hour',
        duration_i18n: { en: '1 hour', ka: '1 საათი' },

        documents: ['Complete file'],
        whereToGo: 'natali (online) or by post',
        organization: 'Préfecture / Ministère',
        officialUrl: 'https://anef.administration-etrangers.interieur.gouv.fr/particuliers/#/',
        instructions: [
          'Submit via the online platform or by registered post.',
          'Keep your submission proof.',
          'Wait for the acknowledgement of receipt.',
        ],
        commonMistakes: ['Submitting an incomplete file.'],
        whatNext: 'You’ll be invited to an integration interview.',
      },
      {
        id: 'nat-5',
        title: 'Attend the integration interview',
        purpose: 'A final assessment of your integration before the decision.',
        title_fr: 'Assister à l\'entretien d\'intégration',
        purpose_fr: 'Une évaluation finale de votre intégration avant la décision.',
        title_i18n: { en: 'Attend the integration interview', ka: 'დასწრებოდეთ ინტეგრაციის ინტერვიუს' },
        purpose_i18n: { en: 'A final assessment of your integration before the decision.', ka: 'თქვენი ინტეგრაციის საბოლოო შეფასება გადაწყვეტილებამდე.' },

        duration: '6–18 months',
        duration_i18n: { en: '6–18 months', ka: '6–18 თვე' },

        documents: ['Convocation', 'Originals of documents'],
        whereToGo: 'Your préfecture',
        organization: 'Préfecture',
        officialUrl: 'https://www.service-public.fr/particuliers/vosdroits/N111',
        instructions: [
          'Bring originals of your documents.',
          'Review basic French history and values.',
          'Answer questions calmly about your life in France.',
        ],
        commonMistakes: ['Forgetting original documents.', 'Not preparing for civic questions.'],
        whatNext: 'You receive a decision; if granted, you’re invited to a citizenship ceremony.',
      },
    ],
  },
  {
    id: 'other',
    title: 'Something else',
    subtitle: 'A general checklist for any procedure',
    icon: 'ellipsis-horizontal-outline',
    accent: Colors.textSecondary,
    steps: [
      {
        id: 'oth-1',
        title: 'Identify the right organization',
        purpose: 'Knowing who handles your request (CAF, CPAM, préfecture…) saves a lot of time.',
        title_fr: 'Identifier la bonne organisation',
        purpose_fr: 'Savoir qui traite votre demande (CAF, CPAM, préfecture…) permet de gagner beaucoup de temps.',
        title_i18n: { en: 'Identify the Right Organization', ka: 'განსაზღვრეთ სწორი ორგანიზაცია' },
        purpose_i18n: { en: 'Knowing who handles your request (CAF, CPAM, prefecture…) saves a lot of time.', ka: 'იცოდეთ, ვინ ამუშავებს თქვენს მოთხოვნას (CAF, CPAM, პრეფექტურა…) დაზოგავს ბევრ დროს.' },

        duration: '30 minutes',
        duration_i18n: { en: '30 minutes', ka: '30 წუთი' },

        documents: ['Your letters / situation'],
        whereToGo: 'Use the AI tools to find out',
        organization: 'PrefAI',
        officialUrl: 'https://www.service-public.fr',
        instructions: [
          'Describe your situation to the AI assistant.',
          'Identify the responsible organization.',
          'Find their official website.',
        ],
        commonMistakes: ['Contacting the wrong administration.'],
        whatNext: 'You know exactly who to deal with.',
      },
      {
        id: 'oth-2',
        title: 'Gather common documents',
        purpose: 'Most procedures need the same core set of papers.',
        title_fr: 'Rassembler les documents courants',
        purpose_fr: 'La plupart des démarches nécessitent le même ensemble de documents de base.',
        title_i18n: { en: 'Gather common documents', ka: 'შეაგროვეთ საერთო დოკუმენტები' },
        purpose_i18n: { en: 'Most procedures require the same core set of documents.', ka: 'უმეტეს პროცედურას სჭირდება იგივე ძირითადი დოკუმენტების ნაკრები.' },

        duration: '1–3 days',
        duration_i18n: { en: '1–3 days', ka: '1–3 დღე' },

        documents: ['Passport / ID', 'Proof of address', 'RIB', 'Residence permit'],
        whereToGo: 'At home',
        organization: '—',
        officialUrl: 'https://www.service-public.fr',
        instructions: [
          'Collect your ID, proof of address and RIB.',
          'Scan each as a clear PDF.',
          'Keep them in one folder.',
        ],
        commonMistakes: ['Out-of-date proof of address.'],
        whatNext: 'You’re ready for almost any administrative request.',
      },
      {
        id: 'oth-3',
        title: 'Prepare your request',
        purpose: 'Translate and write what you need to send.',
        title_fr: 'Préparez votre demande',
        purpose_fr: 'Traduisez et rédigez ce que vous devez envoyer.',
        title_i18n: { en: 'Prepare your request', ka: 'მოამზადეთ თქვენი მოთხოვნა' },
        purpose_i18n: { en: 'Translate and write what you need to send.', ka: 'თარგმნეთ და დაწერეთ ის, რაც უნდა გაგზავნოთ.' },

        duration: '1 day',
        duration_i18n: { en: '1 day', ka: '1 დღე' },

        documents: ['Your situation described'],
        whereToGo: 'AI Reply & Translate tools',
        organization: 'PrefAI',
        officialUrl: 'https://www.service-public.fr',
        instructions: [
          'Use AI Reply to draft your letter in French.',
          'Use Translate to understand any reply.',
          'Review before sending.',
        ],
        commonMistakes: ['Sending without checking the French.'],
        whatNext: 'Your request is ready to submit.',
      },
      {
        id: 'oth-4',
        title: 'Submit and track deadlines',
        purpose: 'Send your request and never miss a response date.',
        title_fr: 'Soumettre et suivre les délais',
        purpose_fr: 'Envoyez votre demande et ne manquez jamais une date de réponse.',
        title_i18n: { en: 'Submit and Track Deadlines', ka: 'გააგზავნეთ და აკონტროლეთ ვადები' },
        purpose_i18n: { en: 'Send your request and never miss a response date.', ka: 'გააგზავნეთ თქვენი მოთხოვნა და არასოდეს გამოტოვოთ პასუხის თარიღი.' },

        duration: 'Varies',
        duration_i18n: { en: 'Varies', ka: 'მრავალფეროვანი' },

        documents: ['Completed request'],
        whereToGo: 'Relevant portal or office',
        organization: '—',
        officialUrl: 'https://www.service-public.fr',
        instructions: [
          'Submit via the correct channel.',
          'Add any deadline to the Deadline Tracker.',
          'Follow up if you hear nothing.',
        ],
        commonMistakes: ['Not tracking the response deadline.'],
        whatNext: 'You stay on top of your procedure from start to finish.',
      },
    ],
  },
];

export const getJourney = (id: JourneyId): Journey =>
  JOURNEYS.find((j) => j.id === id) ?? JOURNEYS[JOURNEYS.length - 1];

export const getJourneyStep = (id: JourneyId, stepId: string): JourneyStep | undefined =>
  getJourney(id).steps.find((s) => s.id === stepId);
