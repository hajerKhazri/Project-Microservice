import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PROJECT_DOMAINS, Project, ProjectDomain } from '../../models/project.model';
import { ProjectsService } from '../../services/projects.service';
import { CandidaturesService } from '../../services/candidatures.service';
import { SessionService } from '../../core/services/session.service';
import { AppUser } from '../../models/user.model';

type ProjectSort = 'date-desc' | 'date-asc' | 'budget-desc' | 'budget-asc' | 'title-asc' | 'title-desc';

interface ProjectFormValue {
  id?: number;
  title: string;
  description: string;
  date: string;
  domaine: ProjectDomain;
  maxCapacity: number;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  providers: [DatePipe],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {
  readonly domaines = PROJECT_DOMAINS;
  private readonly favoriteStorageKey = 'freelink-project-favorites';

  projects: Project[] = [];
  selectedProject: Project | null = null;

  searchTerm = '';
  selectedDomaine = '';
  selectedSort: ProjectSort = 'date-desc';
  favoritesOnly = false;

  loading = false;
  saving = false;
  deletingId?: number;
  errorMessage = '';
  successMessage = '';

  isFormOpen = false;
  isEditMode = false;
  formSubmitted = false;
  formProject: ProjectFormValue = this.createEmptyProject();

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly candidaturesService: CandidaturesService,
    private readonly sessionService: SessionService,
    private readonly datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  get currentUser(): AppUser | null {
    return this.sessionService.getCurrentUser();
  }

  get isFreelancer(): boolean {
    const user = this.currentUser;
    return user?.role === 'FREELANCER';
  }

  get isAdmin(): boolean {
    const user = this.currentUser;
    return Boolean(user?.role === 'ADMIN' || user?.is_superuser);
  }

  get isClient(): boolean {
    return this.currentUser?.role === 'CLIENT';
  }

  get canManageProjects(): boolean {
    return this.isAdmin || this.isClient;
  }

  // Tracks which project IDs are currently being applied to
  applyingProjectId?: number;
  appliedProjectIds: Set<number> = new Set();

  applyToProject(project: Project): void {
    if (!project.id || !this.isFreelancer) return;
    const user = this.currentUser;
    if (!user) return;

    this.applyingProjectId = project.id;
    this.clearMessages();

    const fullName = `${user.first_name} ${user.last_name}`.trim() || user.username;

    this.candidaturesService.create({
      candidateName: fullName,
      email: user.email,
      projectId: project.id
    }).pipe(finalize(() => { this.applyingProjectId = undefined; }))
      .subscribe({
        next: () => {
          this.appliedProjectIds.add(project.id!);
          this.successMessage = `✓ Application submitted for "${project.title}"! Status: PENDING — you can track it in Applications.`;
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(err, 'Failed to submit application. The project may be closed or at full capacity.');
        }
      });
  }

  hasApplied(project: Project): boolean {
    return project.id ? this.appliedProjectIds.has(project.id) : false;
  }

  get filteredProjects(): Project[] {
    let items = [...this.projects];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      items = items.filter((project) =>
        `${project.title} ${project.description} ${project.domaine}`.toLowerCase().includes(term)
      );
    }

    if (this.selectedDomaine) {
      items = items.filter((project) => project.domaine === this.selectedDomaine);
    }

    if (this.favoritesOnly) {
      items = items.filter((project) => project.isFavorite);
    }

    return items.sort((left, right) => this.compareProjects(left, right));
  }

  get totalProjects(): number {
    return this.projects.length;
  }

  get favoriteProjects(): number {
    return this.projects.filter((project) => project.isFavorite).length;
  }

  get averageBudget(): number {
    if (!this.projects.length) {
      return 0;
    }

    const total = this.projects.reduce((sum, project) => sum + (project.estimatedBudget ?? 0), 0);
    return Math.round(total / this.projects.length);
  }

  get urgentProjects(): number {
    return this.projects.filter((project) => this.daysUntil(project.date) <= 7).length;
  }

  loadProjects(): void {
    this.loading = true;
    this.errorMessage = '';

    this.projectsService.getAll()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (projects) => {
          const favoriteIds = this.getFavoriteIds();
          this.projects = (projects ?? []).map((project) => ({
            ...project,
            isFavorite: project.id ? favoriteIds.includes(project.id) : false,
            estimatedBudget: this.estimateBudget(project),
            status: project.status || 'OPEN',
            maxCapacity: project.maxCapacity || 10,
            acceptedCount: 0 // Initial
          }));

          // Fetch accepted counts for each project
          this.projects.forEach(p => {
            if (p.id) {
              this.candidaturesService.getAcceptedCount(p.id).subscribe(count => {
                p.acceptedCount = count;
              });
            }
          });

          if (this.selectedProject?.id) {
            this.selectedProject = this.projects.find((item) => item.id === this.selectedProject?.id) ?? null;
          }

          if (!this.selectedProject && this.projects.length) {
            this.selectedProject = this.projects[0];
          }
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Unable to load projects. Check the gateway and project service.');
        }
      });
  }

  refreshData(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.loadProjects();
  }

  selectProject(project: Project): void {
    this.selectedProject = project;
  }

  toggleFavorite(project: Project): void {
    if (!project.id) {
      return;
    }

    project.isFavorite = !project.isFavorite;
    const favoriteIds = this.getFavoriteIds();

    if (project.isFavorite && !favoriteIds.includes(project.id)) {
      favoriteIds.push(project.id);
    }

    if (!project.isFavorite) {
      const nextIds = favoriteIds.filter((id) => id !== project.id);
      localStorage.setItem(this.favoriteStorageKey, JSON.stringify(nextIds));
      return;
    }

    localStorage.setItem(this.favoriteStorageKey, JSON.stringify(favoriteIds));
  }

  openCreate(): void {
    this.isEditMode = false;
    this.formProject = this.createEmptyProject();
    this.formSubmitted = false;
    this.isFormOpen = true;
    this.clearMessages();
  }

  openEdit(project: Project): void {
    this.isEditMode = true;
    this.formProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      date: project.date,
      domaine: project.domaine,
      maxCapacity: project.maxCapacity || 10
    };
    this.formSubmitted = false;
    this.isFormOpen = true;
    this.clearMessages();
  }

  closeForm(): void {
    if (!this.saving) {
      this.isFormOpen = false;
      this.formSubmitted = false;
    }
  }

  saveProject(projectForm: NgForm): void {
    this.formSubmitted = true;

    if (projectForm.invalid || !this.isValidProject(this.formProject)) {
      projectForm.control.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.clearMessages();

    const payload: Project = {
      title: this.formProject.title.trim(),
      description: this.formProject.description.trim(),
      date: this.formProject.date,
      domaine: this.formProject.domaine,
      maxCapacity: Number(this.formProject.maxCapacity)
    };

    const request = this.isEditMode && this.formProject.id
      ? this.projectsService.update(this.formProject.id, payload)
      : this.projectsService.create(payload);

    request
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe({
        next: () => {
          this.successMessage = this.isEditMode ? 'Project updated successfully.' : 'Project created successfully.';
          this.isFormOpen = false;
          this.formSubmitted = false;
          this.loadProjects();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Unable to save the project right now.');
        }
      });
  }

  deleteProject(project: Project): void {
    if (!project.id || !window.confirm(`Delete project "${project.title}"?`)) {
      return;
    }

    this.deletingId = project.id;
    this.clearMessages();

    this.projectsService.delete(project.id)
      .pipe(finalize(() => {
        this.deletingId = undefined;
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'Project deleted successfully.';
          this.projects = this.projects.filter((item) => item.id !== project.id);
          this.selectedProject = this.selectedProject?.id === project.id ? (this.projects[0] ?? null) : this.selectedProject;
          const nextFavorites = this.getFavoriteIds().filter((id) => id !== project.id);
          localStorage.setItem(this.favoriteStorageKey, JSON.stringify(nextFavorites));
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Unable to delete the project right now.');
        }
      });
  }

  domainLabel(value: ProjectDomain): string {
    return value.replace(/_/g, ' ');
  }

  formatDate(value: string): string {
    return this.datePipe.transform(value, 'dd/MM/yyyy') ?? value;
  }

  budgetLabel(project: Project): string {
    return `${project.estimatedBudget ?? 0} TND`;
  }

  urgencyLabel(project: Project): string {
    const days = this.daysUntil(project.date);

    if (days < 0) {
      return 'Past date';
    }

    if (days <= 7) {
      return 'Urgent';
    }

    if (days <= 15) {
      return 'Soon';
    }

    return 'Planned';
  }

  urgencyClass(project: Project): string {
    const days = this.daysUntil(project.date);

    if (days <= 7) {
      return 'urgent';
    }

    if (days <= 15) {
      return 'soon';
    }

    return 'planned';
  }

  shouldShowError(model: NgModel): boolean {
    return Boolean(model.invalid && (model.touched || this.formSubmitted));
  }

  hasError(model: NgModel, errorKey: string): boolean {
    return this.shouldShowError(model) && Boolean(model.errors?.[errorKey]);
  }

  private compareProjects(left: Project, right: Project): number {
    switch (this.selectedSort) {
      case 'title-asc':
        return left.title.localeCompare(right.title);
      case 'title-desc':
        return right.title.localeCompare(left.title);
      case 'date-asc':
        return new Date(left.date).getTime() - new Date(right.date).getTime();
      case 'budget-asc':
        return (left.estimatedBudget ?? 0) - (right.estimatedBudget ?? 0);
      case 'budget-desc':
        return (right.estimatedBudget ?? 0) - (left.estimatedBudget ?? 0);
      case 'date-desc':
      default:
        return new Date(right.date).getTime() - new Date(left.date).getTime();
    }
  }

  private estimateBudget(project: Project): number {
    const baseRates: Record<ProjectDomain, number> = {
      WEB: 800,
      MOBILE: 1200,
      DESKTOP: 900,
      DATA_SCIENCE: 1500,
      IA: 2000,
      DEVOPS: 1400,
      CYBERSECURITY: 1700,
      CLOUD_COMPUTING: 1600,
      GAME_DEV: 1800,
      IOT: 1500,
      BIG_DATA: 1900,
      BLOCKCHAIN: 2200
    };

    let budget = baseRates[project.domaine] ?? 1000;
    const descriptionLength = project.description?.length ?? 0;

    if (descriptionLength > 300) {
      budget += 700;
    } else if (descriptionLength > 150) {
      budget += 400;
    } else if (descriptionLength > 80) {
      budget += 200;
    }

    const days = this.daysUntil(project.date);

    if (days <= 7 && days >= 0) {
      budget += 500;
    } else if (days <= 15) {
      budget += 250;
    }

    return budget;
  }

  private daysUntil(value: string): number {
    const today = new Date();
    const target = new Date(value);
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  private getFavoriteIds(): number[] {
    const raw = localStorage.getItem(this.favoriteStorageKey);

    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as number[];
    } catch {
      localStorage.removeItem(this.favoriteStorageKey);
      return [];
    }
  }

  private createEmptyProject(): ProjectFormValue {
    return {
      title: '',
      description: '',
      date: '',
      domaine: 'WEB',
      maxCapacity: 10
    };
  }

  private isValidProject(project: ProjectFormValue): boolean {
    return Boolean(project.title.trim())
      && Boolean(project.description.trim())
      && Boolean(project.date)
      && /^[A-Z]/.test(project.title.trim());
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private extractErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return fallbackMessage;
  }
}
