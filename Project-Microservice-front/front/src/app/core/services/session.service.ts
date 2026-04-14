import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppUser } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly storageKey = 'freelink-user-session';
  private readonly userSubject = new BehaviorSubject<AppUser | null>(this.readStoredUser());

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

  private readStoredUser(): AppUser | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const rawValue = localStorage.getItem(this.storageKey);

    if (!rawValue) {
      return null;
    }

    try {
      const parsedUser = JSON.parse(rawValue) as Partial<AppUser> | null;

      if (!parsedUser || typeof parsedUser !== 'object') {
        localStorage.removeItem(this.storageKey);
        return null;
      }

      return {
        id: Number(parsedUser.id ?? 0),
        username: parsedUser.username ?? '',
        first_name: parsedUser.first_name ?? '',
        last_name: parsedUser.last_name ?? '',
        email: parsedUser.email ?? '',
        role: parsedUser.role ?? 'USER',
        enabled: Boolean(parsedUser.enabled),
        is_staff: Boolean(parsedUser.is_staff),
        is_superuser: Boolean(parsedUser.is_superuser),
        created_at: parsedUser.created_at ?? ''
      };
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
