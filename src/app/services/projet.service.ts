import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from '../models/projet.model';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private apiUrl = 'http://localhost:8086/api/projets';

  constructor(private http: HttpClient) {}

  getAllProjets(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.apiUrl}/allprojets`);
  }

  getProjetById(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.apiUrl}/getprojet/${id}`);
  }

  addProjet(projet: Projet): Observable<Projet> {
    return this.http.post<Projet>(`${this.apiUrl}/addprojet`, projet);
  }

  updateProjet(id: number, projet: Projet): Observable<Projet> {
    return this.http.put<Projet>(`${this.apiUrl}/updateprojet/${id}`, projet);
  }

  deleteProjet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteprojet/${id}`);
  }

  getProjetWithReviews(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.apiUrl}/projet-with-reviews/${id}`);
  }
}
