import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Candidature } from '../models/candidature.model';

@Injectable({ providedIn: 'root' })
export class CandidaturesService {
    private readonly apiUrl = environment.candidaturesApiUrl;

    constructor(private readonly http: HttpClient) { }

    getAll(): Observable<Candidature[]> {
        return this.http.get<Candidature[]>(this.apiUrl);
    }

    getById(id: number): Observable<Candidature> {
        return this.http.get<Candidature>(`${this.apiUrl}/${id}`);
    }

    create(candidature: Candidature): Observable<Candidature> {
        return this.http.post<Candidature>(this.apiUrl, candidature);
    }

    update(id: number, candidature: Candidature): Observable<Candidature> {
        return this.http.put<Candidature>(`${this.apiUrl}/${id}`, candidature);
    }

    updateStatus(id: number, status: string): Observable<Candidature> {
        return this.http.put<Candidature>(`${this.apiUrl}/${id}/status?status=${status}`, {});
    }

    getAcceptedCount(projectId: number): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/project/${projectId}/accepted-count`);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
