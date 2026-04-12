export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type CertificateType = 'NONE' | 'CERTIFICATE' | 'DIPLOMA';
export type CertificateStatus = 'NO_CERTIFICATE' | 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
export type SkillBadge = 'BEGINNER' | 'ADVANCED' | 'EXPERT' | 'CERTIFIED_EXPERT';

export interface SkillPayload {
  id?: number;
  name: string;
  level: SkillLevel;
  yearsOfExperience: number;
  description: string;
  certificateType: CertificateType;
  certificateName: string | null;
  certificateExpiresAt: string | null;
}

export interface Skill extends SkillPayload {
  certificateStatus: CertificateStatus;
  score: number;
  badge: SkillBadge;
  nextBadgeTarget: string;
}

export const SKILL_LEVELS: SkillLevel[] = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT'
];

export const CERTIFICATE_TYPES: CertificateType[] = [
  'NONE',
  'CERTIFICATE',
  'DIPLOMA'
];
