import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly apiUrl = environment.projectsApiUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/allprojets`);
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/getprojet/${id}`);
  }

  create(project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/addprojet`, project);
  }

  update(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/updateprojet/${id}`, project);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteprojet/${id}`);
  }
}
