import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../core/services/session.service';
import { PLATFORM_NAV_ITEMS } from '../../data/platform-sections';
import { AppUser } from '../../models/user.model';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './portal-layout.component.html',
  styleUrl: './portal-layout.component.css'
})
export class PortalLayoutComponent {
  readonly navItems = PLATFORM_NAV_ITEMS;
  readonly currentUser$ = this.sessionService.currentUser$;

  constructor(
    private readonly sessionService: SessionService,
    private readonly router: Router
  ) {}

  displayNameFor(user: AppUser): string {
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    return fullName || user.username;
  }

  signOut(): void {
    this.sessionService.clearSession();
    this.router.navigate(['/auth']);
  }
}
