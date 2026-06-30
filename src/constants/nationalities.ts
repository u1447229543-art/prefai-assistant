/**
 * Common nationalities with flag emojis for profile and registration forms.
 */

export interface Nationality {
  name: string;
  flag: string;
}

export const NATIONALITIES: Nationality[] = [
  { name: 'Georgian', flag: '🇬🇪' },
  { name: 'French', flag: '🇫🇷' },
  { name: 'Russian', flag: '🇷🇺' },
  { name: 'Ukrainian', flag: '🇺🇦' },
  { name: 'Moroccan', flag: '🇲🇦' },
  { name: 'Algerian', flag: '🇩🇿' },
  { name: 'Tunisian', flag: '🇹🇳' },
  { name: 'Senegalese', flag: '🇸🇳' },
  { name: 'Chinese', flag: '🇨🇳' },
  { name: 'Indian', flag: '🇮🇳' },
  { name: 'Brazilian', flag: '🇧🇷' },
  { name: 'Argentine', flag: '🇦🇷' },
  { name: 'Turkish', flag: '🇹🇷' },
  { name: 'Egyptian', flag: '🇪🇬' },
  { name: 'Nigerian', flag: '🇳🇬' },
  { name: 'Afghan', flag: '🇦🇫' },
  { name: 'Bangladeshi', flag: '🇧🇩' },
  { name: 'British', flag: '🇬🇧' },
  { name: 'Cameroonian', flag: '🇨🇲' },
  { name: 'Colombian', flag: '🇨🇴' },
  { name: 'Congolese', flag: '🇨🇩' },
  { name: 'Ethiopian', flag: '🇪🇹' },
  { name: 'Filipino', flag: '🇵🇭' },
  { name: 'German', flag: '🇩🇪' },
  { name: 'Iranian', flag: '🇮🇷' },
  { name: 'Iraqi', flag: '🇮🇶' },
  { name: 'Italian', flag: '🇮🇹' },
  { name: 'Ivorian', flag: '🇨🇮' },
  { name: 'Lebanese', flag: '🇱🇧' },
  { name: 'Malian', flag: '🇲🇱' },
  { name: 'Pakistani', flag: '🇵🇰' },
  { name: 'Polish', flag: '🇵🇱' },
  { name: 'Portuguese', flag: '🇵🇹' },
  { name: 'Romanian', flag: '🇷🇴' },
  { name: 'Spanish', flag: '🇪🇸' },
  { name: 'Sri Lankan', flag: '🇱🇰' },
  { name: 'Sudanese', flag: '🇸🇩' },
  { name: 'Syrian', flag: '🇸🇾' },
  { name: 'Vietnamese', flag: '🇻🇳' },
  { name: 'Other', flag: '🌍' },
];

export const getNationalityFlag = (name?: string): string => {
  if (!name) return '🌍';
  const found = NATIONALITIES.find((n) => n.name.toLowerCase() === name.trim().toLowerCase());
  return found?.flag ?? '🌍';
};

export const filterNationalities = (query: string): Nationality[] => {
  const q = query.trim().toLowerCase();
  if (!q) return NATIONALITIES;
  return NATIONALITIES.filter(
    (n) => n.name.toLowerCase().includes(q) || n.flag.includes(q)
  );
};
