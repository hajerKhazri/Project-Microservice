export type CandidatureStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'REJECTED_PROJECT_CLOSED';

export interface Candidature {
  id?: number;
  candidateName: string;
  email: string;
  status?: CandidatureStatus;
  projectId: number;
}

export const CANDIDATURE_STATUSES: CandidatureStatus[] = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'REJECTED_PROJECT_CLOSED'
];
