import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Formation, StatistiquesDTO } from '../models/formation.model';

export interface FormationWithReviews {
  formation: Formation;
  reviews: any[];
}

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private readonly baseUrl = 'http://localhost:8091/api/formations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.baseUrl);
  }

  getById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.baseUrl}/${id}`);
  }

  create(formation: Formation): Observable<Formation> {
    return this.http.post<Formation>(this.baseUrl, formation);
  }

  update(id: number, formation: Formation): Observable<Formation> {
    return this.http.put<Formation>(`${this.baseUrl}/${id}`, formation);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getStatistiques(): Observable<StatistiquesDTO> {
    return this.http.get<StatistiquesDTO>(`${this.baseUrl}/statistiques`);
  }

  getByIdWithReviews(id: number): Observable<FormationWithReviews> {
    return this.http.get<FormationWithReviews>(`${this.baseUrl}/${id}/with-reviews`);
  }
}
