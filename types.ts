export enum AppMode {
  FORMATTER = 'FORMATTER'
}

export type Language = 'pt' | 'en';

export type FontOption = 'Playfair Display' | 'Garamond' | 'Bodoni' | 'Trajan Pro';

export interface GeneratedContent {
  html: string;
  markdown?: string;
}

export interface BookMetadata {
  title: string;
  author: string;
  publisher: string;
  year: string;
  headerText: string;
  footerText: string;
  showPageNumbers: boolean;
  numberCoverPage: boolean;
}