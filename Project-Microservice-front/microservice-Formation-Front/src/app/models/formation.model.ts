export enum StatutFormation {
  PLANIFIE = 'PLANIFIE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE'
}

export interface FichierFormation {
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
  statut: StatutFormation;
  avancement: number;
  createdAt?: string;
  fichiers?: FichierFormation[];
}

export interface StatistiquesDTO {
  totalFormations: number;
  tauxMoyenAvancement: number;
  formationsParStatut: { [key: string]: number };
  formationsEnCours: number;
  formationsTerminees: number;
  formationsPlanifiees: number;
  dureeMoyenneJours: number;
  progressionGlobale: number;
}
