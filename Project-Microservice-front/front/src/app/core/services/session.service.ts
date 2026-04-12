import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppUser } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly storageKey = 'freelink-user-session';
  private readonly userSubject = new BehaviorSubject<AppUser | null>(null);

  readonly currentUser$ = this.userSubject.asObservable();

  getCurrentUser(): AppUser | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return Boolean(this.userSubject.value);
  }

  setCurrentUser(user: AppUser): void {
    this.userSubject.next(user);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  clearSession(): void {
    this.userSubject.next(null);
    localStorage.removeItem(this.storageKey);
  }
}
