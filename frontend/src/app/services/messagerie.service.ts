import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Messagerie } from '../models/messagerie.model';

@Injectable({
  providedIn: 'root'
})
export class MessagerieService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8060/api/messageries';

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
