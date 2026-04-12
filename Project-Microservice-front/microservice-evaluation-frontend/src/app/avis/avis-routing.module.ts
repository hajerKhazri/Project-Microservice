import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListAvisComponent } from './list-avis/list-avis.component';
import { AddAvisComponent } from './add-avis/add-avis.component';
import { EditAvisComponent } from './edit-avis/edit-avis.component';

const routes: Routes = [
  { path: '', component: ListAvisComponent },
  { path: 'add', component: AddAvisComponent },
  { path: 'edit/:id', component: EditAvisComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AvisRoutingModule { }