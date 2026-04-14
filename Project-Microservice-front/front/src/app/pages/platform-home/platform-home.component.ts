import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { SessionService } from '../../core/services/session.service';
import { HOME_SERVICE_CARDS } from '../../data/platform-sections';
import { AppUser, UserRole } from '../../models/user.model';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-platform-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './platform-home.component.html',
  styleUrl: './platform-home.component.css'
})
export class PlatformHomeComponent implements OnInit {
  readonly serviceCards = HOME_SERVICE_CARDS;

  currentUser: AppUser | null = null;
  promoting = false;
  errorMessage = '';

  constructor(
    private readonly sessionService: SessionService,
    private readonly usersService: UsersService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.sessionService.getCurrentUser();
  }

  get isFreelancer(): boolean {
    return this.currentUser?.role === 'FREELANCER';
  }

  displayNameFor(user: AppUser | null): string {
    if (!user) {
      return 'user';
    }

    const fullName = `${user.first_name} ${user.last_name}`.trim();
    return fullName || user.username;
  }

  roleLabel(role?: UserRole): string {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'CLIENT':
        return 'Client';
      case 'FREELANCER':
        return 'Freelancer';
      default:
        return 'User';
    }
  }

  becomeFreelancer(): void {
    if (!this.currentUser) {
      return;
    }

    if (this.isFreelancer) {
      this.router.navigate(['/skills']);
      return;
    }

    this.promoting = true;
    this.errorMessage = '';

    this.usersService.promoteToFreelancer(this.currentUser)
      .pipe(finalize(() => {
        this.promoting = false;
      }))
      .subscribe({
        next: (updatedUser) => {
          this.currentUser = updatedUser;
          this.sessionService.setCurrentUser(updatedUser);
          this.router.navigate(['/skills']);
        },
        error: () => {
          this.errorMessage = 'Unable to update the role right now. Check the user-service and the gateway.';
        }
      });
  }
}
