import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppUser, LoginPayload, LoginResponse, UserPayload } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly apiUrl = environment.usersApiUrl;
  private readonly authApiUrl = environment.usersAuthApiUrl;

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authApiUrl}/login/`, payload);
  }

  getAll(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.apiUrl}/`);
  }

  create(user: UserPayload): Observable<AppUser> {
    return this.http.post<AppUser>(`${this.apiUrl}/`, user);
  }

  update(id: number, user: UserPayload): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.apiUrl}/${id}/`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}
