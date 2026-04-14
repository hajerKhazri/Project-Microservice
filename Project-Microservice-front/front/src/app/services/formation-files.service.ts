import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FormationFile } from '../models/formation.model';

@Injectable({ providedIn: 'root' })
export class FormationFilesService {
  private readonly apiUrl = environment.formationsApiUrl;

  constructor(private readonly http: HttpClient) {}

  list(formationId: number): Observable<FormationFile[]> {
    return this.http.get<FormationFile[]>(`${this.apiUrl}/${formationId}/fichiers`);
  }

  upload(formationId: number, file: File): Observable<FormationFile> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FormationFile>(`${this.apiUrl}/${formationId}/fichiers`, formData);
  }

  download(formationId: number, fileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${formationId}/fichiers/${fileId}/download`, {
      responseType: 'blob'
    });
  }

  delete(formationId: number, fileId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${formationId}/fichiers/${fileId}`);
  }
}
