import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProjetListComponent } from './projets/projet-list/projet-list.component';
import { ProjetFormComponent } from './projets/projet-form/projet-form.component';
import { ProjetDetailComponent } from './projets/projet-detail/projet-detail.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },

  { path: 'projets', component: ProjetListComponent },
  { path: 'projets/new', component: ProjetFormComponent },
  { path: 'projets/edit/:id', component: ProjetFormComponent },
  { path: 'projets/:id', component: ProjetDetailComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },

  { path: '**', redirectTo: 'home' }
];
