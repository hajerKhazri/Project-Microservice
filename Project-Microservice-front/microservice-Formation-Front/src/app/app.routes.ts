import { Routes } from '@angular/router';
import { FormationListComponent } from './components/formation-list/formation-list.component';
import { FormationFormComponent } from './components/formation-form/formation-form.component';
import { FormationDetailComponent } from './components/formation-detail/formation-detail.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/formations', pathMatch: 'full' },
  { path: 'formations', component: FormationListComponent },
  { path: 'formations/new', component: FormationFormComponent },
  { path: 'formations/:id', component: FormationDetailComponent },
  { path: 'formations/:id/edit', component: FormationFormComponent },
  { path: 'dashboard', component: DashboardComponent }
];
