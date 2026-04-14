import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'avis',
    loadComponent: () =>
      import('./avis/list-avis/list-avis.component')
        .then(c => c.ListAvisComponent)
  },
  {
    path: 'avis/add',
    loadComponent: () =>
      import('./avis/add-avis/add-avis.component')
        .then(c => c.AddAvisComponent)
  },
  {
    path: 'avis/edit/:id',
    loadComponent: () =>
      import('./avis/edit-avis/edit-avis.component')
        .then(c => c.EditAvisComponent)
  },
  { path: '', redirectTo: 'avis', pathMatch: 'full' },
  { path: '**', redirectTo: 'avis' }
];