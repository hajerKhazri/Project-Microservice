import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FichierFormation } from '../models/formation.model';

@Injectable({
  providedIn: 'root'
})
export class FichierService {
  private readonly baseUrl = 'http://localhost:8091/api/formations';

  constructor(private http: HttpClient) {}

  list(formationId: number): Observable<FichierFormation[]> {
    return this.http.get<FichierFormation[]>(`${this.baseUrl}/${formationId}/fichiers`);
  }

  upload(formationId: number, file: File): Observable<FichierFormation> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FichierFormation>(
      `${this.baseUrl}/${formationId}/fichiers`,
      formData
    );
  }

  download(formationId: number, fichierId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/${formationId}/fichiers/${fichierId}/download`,
      { responseType: 'blob' }
    );
  }

  delete(formationId: number, fichierId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${formationId}/fichiers/${fichierId}`
    );
  }
}
