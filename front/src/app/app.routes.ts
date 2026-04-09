import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { SkillsComponent } from './pages/skills/skills.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'FreeLink' },
  { path: 'skills', component: SkillsComponent, title: 'FreeLink - Skills' },
  { path: 'jobs', component: JobsComponent, title: 'FreeLink - Jobs' },
  { path: 'proofs', redirectTo: 'skills', pathMatch: 'full' },
  { path: 'portfolio', redirectTo: 'skills', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
