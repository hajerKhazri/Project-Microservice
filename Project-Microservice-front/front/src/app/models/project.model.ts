export type ProjectDomain =
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

export interface Project {
  id?: number;
  title: string;
  description: string;
  date: string;
  domaine: ProjectDomain;
  estimatedBudget?: number;
  status?: 'OPEN' | 'CLOSED';
  maxCapacity?: number;
  acceptedCount?: number;
  isFavorite?: boolean;
}

export const PROJECT_DOMAINS: ProjectDomain[] = [
  'WEB',
  'MOBILE',
  'DESKTOP',
  'DATA_SCIENCE',
  'IA',
  'DEVOPS',
  'CYBERSECURITY',
  'CLOUD_COMPUTING',
  'GAME_DEV',
  'IOT',
  'BIG_DATA',
  'BLOCKCHAIN'
];
