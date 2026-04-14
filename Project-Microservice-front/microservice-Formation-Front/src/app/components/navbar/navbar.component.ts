import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>school</mat-icon>
      <span class="title">Gestion Formation</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/formations" routerLinkActive="active">
        <mat-icon>list</mat-icon> Formations
      </a>
      <a mat-button routerLink="/dashboard" routerLinkActive="active">
        <mat-icon>dashboard</mat-icon> Dashboard
      </a>
    </mat-toolbar>
  `,
  styles: [`
    .title { margin-left: 8px; font-weight: 500; }
    .spacer { flex: 1 1 auto; }
    .active { background: rgba(255,255,255,0.15); }
    mat-icon { vertical-align: middle; }
  `]
})
export class NavbarComponent {}
