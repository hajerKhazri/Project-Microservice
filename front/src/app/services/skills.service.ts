import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Skill, SkillPayload } from '../models/skill.model';

@Injectable({ providedIn: 'root' })
export class SkillsService {
  private readonly apiUrl = environment.skillsApiUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/all`);
  }

  create(skill: SkillPayload): Observable<Skill> {
    return this.http.post<Skill>(`${this.apiUrl}/add`, skill);
  }

  update(skill: SkillPayload): Observable<Skill> {
    return this.http.put<Skill>(`${this.apiUrl}/update`, skill);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
