export type Domaine =
  | 'WEB'
  | 'MOBILE'
  | 'DESKTOP'
  | 'DATA_SCIENCE'
  | 'IA'
  | 'DEVOPS'
  | 'CYBERSECURITY'
  | 'CLOUD_COMPUTING'
  | 'GAME_DEV'
  | 'IOT'
  | 'BIG_DATA'
  | 'BLOCKCHAIN';

export interface ReviewDTO {
  id?: number;
  comment?: string;
  score?: number;
  createdReview?: string;
}

export interface Projet {
  id?: number;
  title: string;
  description: string;
  date: string;
  domaine: Domaine;
  isFavorite?: boolean;
  estimatedBudget?: number;

  reviews?: ReviewDTO[];
}
