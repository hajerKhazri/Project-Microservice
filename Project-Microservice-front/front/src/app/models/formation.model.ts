export type FormationStatus = 'PLANIFIE' | 'EN_COURS' | 'TERMINE';

export interface FormationFile {
  id: number;
  nomFichier: string;
  typeFichier: string;
  tailleFichier: number;
  dateUpload: string;
}

export interface Formation {
  id?: number;
  titre: string;
  description?: string;
  dateDebut?: string;
  dateFin?: string;
  statut: FormationStatus;
  avancement: number;
  createdAt?: string;
  fichiers?: FormationFile[];
}

export interface FormationStats {
  totalFormations: number;
  tauxMoyenAvancement: number;
  formationsParStatut: Record<string, number>;
  formationsEnCours: number;
  formationsTerminees: number;
  formationsPlanifiees: number;
  dureeMoyenneJours: number;
  progressionGlobale: number;
}

export const FORMATION_STATUSES: FormationStatus[] = [
  'PLANIFIE',
  'EN_COURS',
  'TERMINE'
];
