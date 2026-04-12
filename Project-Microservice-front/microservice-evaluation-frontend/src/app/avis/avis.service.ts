// src/app/avis.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Avis {
  id?: number;
  clientName: string;      // email évaluateur
  comment: string;
  score: number;
  freelancerId?: number;
  freelancerName?: string;
  projectName?: string;
  isAnonymous?: boolean;
  evaluatorName?: string;
}

@Injectable({ providedIn: 'root' })
export class AvisService {
  // Adaptez l'URL à votre backend
  private apiUrl = 'http://localhost:8091/reviews';

  constructor(private http: HttpClient) {}

  getAvis(): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.apiUrl}/all`);
  }

  getAvisById(id: number): Observable<Avis> {
    return this.http.get<Avis>(`${this.apiUrl}/${id}`);
  }

  addAvis(avis: Avis): Observable<Avis> {
    return this.http.post<Avis>(`${this.apiUrl}/add`, avis);
  }

  updateAvis(id: number, avis: Avis): Observable<Avis> {
    return this.http.put<Avis>(`${this.apiUrl}/update/${id}`, avis);
  }

  deleteAvis(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
   // Nouvelle méthode : moyenne pour un freelancer spécifique
  getAverageNoteForFreelancer(freelancerId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/freelancer/${freelancerId}/average`);
  }

  // Nouvelle méthode : moyennes de tous les freelancers (Map)
  getAllAverages(): Observable<Map<number, number>> {
    return this.http.get<Map<number, number>>(`${this.apiUrl}/averages`);
  }
  // avis.service.ts
getAdminStats(): Observable<any> {
  return this.http.get(`${this.apiUrl}/admin/stats`);
}
getTopFreelancers(limit: number = 5): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/admin/top-freelancers?limit=${limit}`);
}
getScoreDistribution(): Observable<Map<number, number>> {
  return this.http.get<Map<number, number>>(`${this.apiUrl}/admin/score-distribution`);
}
}
