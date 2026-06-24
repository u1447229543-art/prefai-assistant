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
    subtitle: 'Housing aid (APL), family allowances & RSA',
    icon: 'home-outline',
    accent: Colors.blue,
    steps: [
      {
        title: 'Create your CAF account',
        body: 'Go to caf.fr and click "Mon Compte". You need a numéro allocataire (sent by mail) or you can register as a new allocataire online.',
      },
      {
        title: 'Gather documents',
        body: 'ID/passport, titre de séjour, RIB (bank details), proof of address, rent contract (bail) for APL, and recent payslips.',
      },
      {
        title: 'Apply for APL (housing aid)',
        body: 'Use "Faire une demande de prestation" → "Logement". Enter your rent, landlord details and household income.',
      },
      {
        title: 'Declare your situation quarterly',
        body: 'For RSA / Prime d\'activité you must declare your income every 3 months ("Déclaration trimestrielle").',
      },
      {
        title: 'Track and respond',
        body: 'Watch for "Mes paiements" and any "Pièces à fournir" requests. Missing documents pause your payments.',
      },
    ],
  },
  {
    id: 'cpam',
    title: 'CPAM / Assurance Maladie',
    subtitle: 'Health insurance, carte Vitale & reimbursements',
    icon: 'medkit-outline',
    accent: Colors.red,
    steps: [
      {
        title: 'Get a social security number',
        body: 'Apply for a numéro de sécurité sociale via your CPAM with ID, birth certificate (translated) and proof of residence.',
      },
      {
        title: 'Open your Ameli account',
        body: 'Once you have a numéro, register on ameli.fr to manage reimbursements and documents.',
      },
      {
        title: 'Request your carte Vitale',
        body: 'Send a photo and ID through Ameli. Meanwhile keep your attestation de droits as proof of coverage.',
      },
      {
        title: 'Choose a médecin traitant',
        body: 'Declare a primary doctor to get full reimbursement rates. Do it in the doctor\'s office or via Ameli.',
      },
      {
        title: 'Get a mutuelle',
        body: 'Complementary insurance covers what CPAM does not. Ask your employer first — they often co-fund it.',
      },
    ],
  },
  {
    id: 'prefecture',
    title: 'Préfecture / Titre de séjour',
    subtitle: 'Residence permits, renewals & ANEF',
    icon: 'business-outline',
    accent: '#7B61FF',
    steps: [
      {
        title: 'Identify your permit type',
        body: 'Student, salarié, vie privée et familiale, passeport talent… each has different documents and timelines.',
      },
      {
        title: 'Use ANEF online',
        body: 'Most procedures are now on administration-etrangers.interieur.gouv.fr (ANEF). Create an account to start your demande.',
      },
      {
        title: 'Prepare your dossier',
        body: 'Passport, current titre, justificatif de domicile (< 3 months), photos (e-photo code), and proof specific to your status.',
      },
      {
        title: 'Renew on time',
        body: 'Start renewal 2-3 months before expiry. You will get a récépissé / attestation de prolongation that proves legal stay.',
      },
      {
        title: 'Attend your appointment',
        body: 'Bring originals + copies. Pay the taxe (timbres fiscaux) online or at a tabac.',
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
