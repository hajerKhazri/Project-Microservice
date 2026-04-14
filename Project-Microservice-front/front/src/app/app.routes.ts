import { Routes } from '@angular/router';
import { JobsComponent } from './pages/jobs/jobs.component';
import { SkillsComponent } from './pages/skills/skills.component';
import { UsersComponent } from './pages/users/users.component';
import { authChildGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { PortalLayoutComponent } from './layout/portal-layout/portal-layout.component';
import { EvaluationsComponent } from './pages/evaluations/evaluations.component';
import { FormationsComponent } from './pages/formations/formations.component';
import { PlatformHomeComponent } from './pages/platform-home/platform-home.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { CommunicationsComponent } from './pages/communications/communications.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  { path: 'auth', component: UsersComponent, canActivate: [guestGuard], title: 'FreeLink - Sign In' },
  {
    path: '',
    component: PortalLayoutComponent,
    canActivateChild: [authChildGuard],
    children: [
      { path: 'home', component: PlatformHomeComponent, title: 'FreeLink - Home' },
      { path: 'users', component: UsersComponent, title: 'FreeLink - Users' },
      { path: 'skills', component: SkillsComponent, title: 'FreeLink - Skills' },
      { path: 'jobs', component: JobsComponent, title: 'FreeLink - Jobs' },
      { path: 'projects', component: ProjectsComponent, title: 'FreeLink - Projects' },
      { path: 'formations', component: FormationsComponent, title: 'FreeLink - Formations' },
      { path: 'evaluations', component: EvaluationsComponent, title: 'FreeLink - Evaluations' },
      { path: 'communications', component: CommunicationsComponent, title: 'FreeLink - Communications' },
      { path: 'proofs', redirectTo: 'skills', pathMatch: 'full' },
      { path: 'portfolio', redirectTo: 'skills', pathMatch: 'full' },
      { path: '**', redirectTo: 'home' }
    ]
  }
];
