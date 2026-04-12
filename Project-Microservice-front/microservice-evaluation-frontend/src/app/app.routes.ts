// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ListAvisComponent } from './avis/list-avis/list-avis.component';
import { AddAvisComponent } from './avis/add-avis/add-avis.component';
import { EditAvisComponent } from './avis/edit-avis/edit-avis.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
export const routes: Routes = [
  { path: '', redirectTo: '/avis', pathMatch: 'full' },
  { path: 'avis', component: ListAvisComponent },
  { path: 'avis/add', component: AddAvisComponent },
  { path: 'avis/edit/:id', component: EditAvisComponent },
  { path: 'admin', component: AdminDashboardComponent }
];