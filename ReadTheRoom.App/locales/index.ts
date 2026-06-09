import { en } from './en';
import { ko } from './ko';

export type AppLanguage = keyof typeof locales;

export const locales = {
  en,
  ko,
} as const;
