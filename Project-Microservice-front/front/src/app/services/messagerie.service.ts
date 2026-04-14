import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Messagerie } from '../models/messagerie.model';

@Injectable({
  providedIn: 'root'
})
export class MessagerieService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.messagerieApiUrl;

  getAllMessages(): Observable<Messagerie[]> {
    return this.http.get<Messagerie[]>(this.apiUrl);
  }

  getConversation(user1Id: number, user2Id: number): Observable<Messagerie[]> {
    return this.http.get<Messagerie[]>(`${this.apiUrl}/conversation/${user1Id}/${user2Id}`);
  }

  sendMessage(message: Messagerie): Observable<Messagerie> {
    return this.http.post<Messagerie>(this.apiUrl, message);
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateMessage(id: number, message: Messagerie): Observable<Messagerie> {
    return this.http.put<Messagerie>(`${this.apiUrl}/${id}`, message);
  }
}
