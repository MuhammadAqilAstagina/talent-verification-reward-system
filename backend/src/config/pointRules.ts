export const CATEGORIES = {
  SERTIFIKAT: 'sertifikat',
  PORTOFOLIO: 'portofolio',
} as const;

export const SUB_TYPES = {
  // Sertifikat
  LOKAL: 'lokal',
  REGIONAL: 'regional',
  NASIONAL: 'nasional',
  INTERNASIONAL: 'internasional',
  
  // Portofolio
  PERSONAL: 'personal',
  FREELANCE: 'freelance',
  INDUSTRI: 'industri',
  JUARA_KOMPETISI: 'juara_kompetisi',
} as const;

export type CategoryType = typeof CATEGORIES[keyof typeof CATEGORIES];
export type SubTypeType = typeof SUB_TYPES[keyof typeof SUB_TYPES];

export const POINT_RULES: Record<SubTypeType, number> = {
  // Sertifikat
  [SUB_TYPES.LOKAL]: 1,
  [SUB_TYPES.REGIONAL]: 3,
  [SUB_TYPES.NASIONAL]: 5,
  [SUB_TYPES.INTERNASIONAL]: 10,
  
  // Portofolio
  [SUB_TYPES.PERSONAL]: 2,
  [SUB_TYPES.FREELANCE]: 5,
  [SUB_TYPES.INDUSTRI]: 8,
  [SUB_TYPES.JUARA_KOMPETISI]: 10,
};

export function getPointValue(subType: string): number {
  if (subType in POINT_RULES) {
    return POINT_RULES[subType as SubTypeType];
  }
  return 0;
}
