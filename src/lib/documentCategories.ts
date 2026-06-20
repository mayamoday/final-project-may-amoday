export const documentCategories = ['חינוך', 'בטיחות', 'ספורט', 'אמנות', 'נהלים'] as const;

export type DocumentCategory = typeof documentCategories[number];
