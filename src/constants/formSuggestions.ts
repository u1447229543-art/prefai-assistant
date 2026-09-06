/**
 * Shared form / procedure suggestions used by Form Assistant and AI Reply (Other).
 * Official French names (CAF, ANEF, CPAM, OFPRA, France Travail, APL, RSA, …) stay untranslated.
 */

export type FormSuggestion = {
  label: string;
  query: string;
};

export const FORM_SUGGESTIONS: FormSuggestion[] = [
  { label: 'RSA', query: 'CERFA 13360 (RSA)' },
  { label: 'Demande APL (CAF)', query: 'Demande APL (CAF)' },
  { label: 'Titre de séjour (ANEF)', query: 'Titre de séjour (ANEF)' },
  { label: 'Déclaration de revenus', query: 'Déclaration de revenus' },
  { label: 'Carte Vitale (CPAM)', query: 'Carte Vitale (CPAM)' },
  {
    label: 'Visa long séjour (demande de VLS-TS)',
    query: 'Cerfa 14571 — Visa long séjour (demande de VLS-TS)',
  },
  {
    label: 'Renouvellement titre de séjour (carte de séjour)',
    query: 'Cerfa 15186 — Renouvellement titre de séjour (carte de séjour)',
  },
  {
    label: "Attestation d'accueil (hosting certificate for visitors)",
    query: "Cerfa 11580 — Attestation d'accueil (hosting certificate for visitors)",
  },
  {
    label: "Attestation d'hébergement (proof of housing)",
    query: "Cerfa 10798 — Attestation d'hébergement (proof of housing)",
  },
  {
    label: "Certificat d'immatriculation (carte grise)",
    query: "Cerfa 13750 — Certificat d'immatriculation (carte grise)",
  },
  {
    label: "Déclaration d'activité (auto-entrepreneur)",
    query: "Cerfa 12669 — Déclaration d'activité (auto-entrepreneur)",
  },
  {
    label: 'Inscription France Travail (ex Pôle Emploi)',
    query: 'Cerfa 15547 — Inscription France Travail (ex Pôle Emploi)',
  },
  {
    label: 'Mariage / PACS (demande de mariage ou PACS)',
    query: 'Cerfa 13411 — Mariage / PACS (demande de mariage ou PACS)',
  },
  {
    label: 'Demande de retraite (pension request)',
    query: 'Cerfa 12100 — Demande de retraite (pension request)',
  },
  {
    label: 'Regroupement familial (family reunification)',
    query: 'Cerfa 14879 — Regroupement familial (family reunification)',
  },
  {
    label: "Demande d'asile OFPRA (asylum application)",
    query: "Cerfa 15497 — Demande d'asile OFPRA (asylum application)",
  },
  {
    label: 'Naturalisation (demande de nationalité française)',
    query: 'Cerfa 11421 — Naturalisation (demande de nationalité française)',
  },
  {
    label: 'Inscription scolaire (school enrollment)',
    query: 'Cerfa 13750-04 — Inscription scolaire (school enrollment)',
  },
  {
    label: 'Autorisation de travail (work permit)',
    query: 'Cerfa 14880 — Autorisation de travail (work permit)',
  },
  {
    label: 'Renouvellement APL (CAF housing aid renewal)',
    query: 'Cerfa 15692 — Renouvellement APL (CAF housing aid renewal)',
  },
  {
    label: 'Numéro fiscal (tax number request)',
    query: 'Cerfa 10071 — Numéro fiscal (tax number request)',
  },
  {
    label: "Changement d'adresse (change of address)",
    query: "Cerfa 13969 — Changement d'adresse (change of address)",
  },
  {
    label: 'Première demande Carte Vitale (CPAM)',
    query: 'Cerfa 12485 — Première demande Carte Vitale (CPAM)',
  },
];

export function filterFormSuggestions(search: string): FormSuggestion[] {
  const q = search.trim().toLowerCase();
  if (!q) return FORM_SUGGESTIONS;
  return FORM_SUGGESTIONS.filter(
    (s) => s.label.toLowerCase().includes(q) || s.query.toLowerCase().includes(q)
  );
}
