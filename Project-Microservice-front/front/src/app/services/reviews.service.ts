import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Review, ReviewStats, TopFreelancer } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly apiUrl = environment.evaluationsApiUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/all`);
  }

  create(review: Review): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/add`, review);
  }

  update(id: number, review: Review): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/update/${id}`, review);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  getStats(): Observable<ReviewStats> {
    return this.http.get<ReviewStats>(`${this.apiUrl}/admin/stats`);
  }

  getTopFreelancers(limit = 5): Observable<TopFreelancer[]> {
    return this.http.get<TopFreelancer[]>(`${this.apiUrl}/admin/top-freelancers?limit=${limit}`);
  }

  getScoreDistribution(): Observable<Record<number, number>> {
    return this.http.get<Record<number, number>>(`${this.apiUrl}/admin/score-distribution`);
  }
}
