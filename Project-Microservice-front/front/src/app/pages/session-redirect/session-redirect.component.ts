import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-session-redirect',
  standalone: true,
  template: ''
})
export class SessionRedirectComponent implements OnInit {
  constructor(
    private readonly sessionService: SessionService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.router.navigateByUrl(this.sessionService.isAuthenticated() ? '/home' : '/auth', {
      replaceUrl: true
    });
  }
}
