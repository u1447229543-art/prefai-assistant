import { Ionicons } from '@expo/vector-icons';
import { Colors } from './colors';

export interface GuideStep {
  title: string;
  body: string;
}

export interface Guide {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  steps: GuideStep[];
}

export const GUIDES: Guide[] = [
  {
    id: 'caf',
    title: 'CAF Guide',
    subtitle: 'Housing aid (APL, ALF, ALS), family & activity benefits',
    icon: 'home-outline',
    accent: Colors.blue,
    steps: [
      {
        title: 'Create your CAF account online',
        body:
          'Registration is online-only on caf.fr — the paper Cerfa 10840 is no longer used for most people. ' +
          'Sign in with FranceConnect or create a CAF account, then register as a new allocataire with your ID, email and RIB.',
      },
      {
        title: 'Gather documents',
        body:
          'ID/passport, titre de séjour, RIB, proof of address, rental contract (bail), income details and landlord information. ' +
          'You also need your numéro de Sécurité sociale from CPAM before CAF can finalise your file.',
      },
      {
        title: 'Apply for housing aid',
        body:
          'Start a housing aid request on caf.fr. CAF automatically assigns APL, ALF, or ALS — whichever is most beneficial; you do not choose. ' +
          'In colocation, each tenant must apply separately. The first month of rental never receives aid (mois de carence).',
      },
      {
        title: 'Understand payment & recalculation',
        body:
          'Aid is normally paid on the 5th of each month. 2026 exceptions: 7 April, 6 July, 4 September, 4 December. ' +
          'Your income is recalculated automatically every 3 months — rising income reduces your payment.',
      },
      {
        title: 'Track and respond',
        body:
          'Check “Mes paiements” and CAF messages regularly. Report moves, job changes or family changes promptly. ' +
          'Missing documents or undeclared income can pause payments or create repayments.',
      },
    ],
  },
  {
    id: 'cpam',
    title: 'CPAM / Assurance Maladie',
    subtitle: 'Health insurance, Carte Vitale & reimbursements',
    icon: 'medkit-outline',
    accent: Colors.red,
    steps: [
      {
        title: 'Register for coverage',
        body:
          'Employees: your employer files the DPAE — CPAM registration is usually automatic. ' +
          'Others: apply on ameli.fr via “Je n’ai pas de numéro de Sécurité sociale” or visit your CPAM in person. ' +
          'Students: use etudiant-etranger.ameli.fr. Without a titre de séjour: AME (Aide Médicale de l’État) after 3 months in France.',
      },
      {
        title: 'Get your social security number',
        body:
          'A temporary number (NIA) usually arrives in 1–4 weeks. Your permanent numéro de Sécurité sociale follows by post. ' +
          'Download your attestation de droits on ameli.fr within 1–2 months and use it until your Carte Vitale arrives.',
      },
      {
        title: 'Open your Ameli account',
        body:
          'Register on ameli.fr with your social security number or NIA. Add your RIB so reimbursements are paid directly to your bank account.',
      },
      {
        title: 'Request your Carte Vitale',
        body:
          'Order the card through your Ameli account with a compliant e-photo and ID. ' +
          'The physical Carte Vitale usually arrives by post in 2–4 months; keep using your attestation in the meantime.',
      },
      {
        title: 'Choose a médecin traitant & CSS',
        body:
          'Declare a GP as your médecin traitant at the doctor’s office for the best reimbursement rate. ' +
          'On a low income, apply for CSS (Complémentaire Santé Solidaire) on ameli.fr — free or near-free mutuelle cover.',
      },
    ],
  },
  {
    id: 'prefecture',
    title: 'Préfecture / Titre de séjour',
    subtitle: 'Residence permits, renewals & ANEF (2025/2026)',
    icon: 'business-outline',
    accent: '#7B61FF',
    steps: [
      {
        title: 'Identify your permit type',
        body:
          'Student, salarié, vie privée et familiale, passeport talent… each has different documents and timelines. ' +
          'Check the exact list on service-public.fr or demarchesetrangers.fr for your situation.',
      },
      {
        title: 'Use ANEF online',
        body:
          'All applications and renewals are on anef.administration-etrangers.interieur.gouv.fr (also listed on demarchesetrangers.fr). ' +
          'Create an account and start your demande or renewal online — do not use outdated portal URLs.',
      },
      {
        title: 'Prepare your dossier (2026 rules)',
        body:
          'Passport, current titre, justificatif de domicile (< 6 months), ePhoto code, proof of resources, and status-specific documents. ' +
          'Since 2026: mandatory French test (A2 for carte pluriannuelle, B1 for carte de résident) and civic test (test civique) certificates.',
      },
      {
        title: 'Renew on time',
        body:
          'Apply between 4 months and 2 months before expiry — not 3 months. Processing target is 55 days (plan Nuñez, April 2026). ' +
          'You receive a récépissé proving legal stay. If there is no decision after 4 months, that counts as implicit rejection, not approval.',
      },
      {
        title: 'Collect your card & pay timbre fiscal',
        body:
          'When notified on ANEF, buy the timbre fiscal online: €350 for a first card, €250 for a renewal (rates since 1 May 2026). ' +
          'Collect the physical card in person with your passport and payment proof.',
      },
    ],
  },
  {
    id: 'impots',
    title: 'Impôts / Taxes',
    subtitle: 'Income tax declaration & tax number',
    icon: 'cash-outline',
    accent: Colors.success,
    steps: [
      {
        title: 'Get a numéro fiscal',
        body: 'First-timers can request one at the Service des Impôts des Particuliers (SIP) or via the contact form on impots.gouv.fr.',
      },
      {
        title: 'Create your espace particulier',
        body: 'Log in on impots.gouv.fr to access your déclaration and tax documents.',
      },
      {
        title: 'Declare yearly income',
        body: 'The déclaration runs April–June. Even with no income you should declare to access rights and avis d\'imposition.',
      },
      {
        title: 'Understand prélèvement à la source',
        body: 'Tax is withheld monthly. Check your taux and update it after a change in income or family situation.',
      },
      {
        title: 'Keep your avis',
        body: 'Your avis d\'imposition is required for CAF, housing, visas and many other procedures.',
      },
    ],
  },
];

export const getGuide = (id: string) => GUIDES.find((g) => g.id === id);
