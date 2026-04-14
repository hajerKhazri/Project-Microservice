import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { finalize } from 'rxjs';
import { SessionService } from '../../core/services/session.service';
import { Candidature, CandidatureStatus, CANDIDATURE_STATUSES } from '../../models/candidature.model';
import { Project } from '../../models/project.model';
import { CandidaturesService } from '../../services/candidatures.service';
import { ProjectsService } from '../../services/projects.service';

type StatusFilter = '' | CandidatureStatus;
type CandidatureSort = 'name-asc' | 'name-desc' | 'status' | 'project';

interface CandidatureFormValue {
    id?: number;
    candidateName: string;
    email: string;
    projectId: number | null;
}

@Component({
    selector: 'app-candidatures',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [DatePipe],
    templateUrl: './candidatures.component.html',
    styleUrl: './candidatures.component.css'
})
export class CandidaturesComponent implements OnInit {
    readonly allStatuses = CANDIDATURE_STATUSES;

    candidatures: Candidature[] = [];
    projects: Project[] = [];
    selectedCandidature: Candidature | null = null;

    searchTerm = '';
    statusFilter: StatusFilter = '';
    selectedSort: CandidatureSort = 'name-asc';

    loading = false;
    saving = false;
    updatingStatusId?: number;
    deletingId?: number;
    errorMessage = '';
    successMessage = '';

    isFormOpen = false;
    isEditMode = false;
    formSubmitted = false;
    formCandidature: CandidatureFormValue = this.createEmpty();

    constructor(
        private readonly candidaturesService: CandidaturesService,
        private readonly projectsService: ProjectsService,
        private readonly sessionService: SessionService
    ) { }

    ngOnInit(): void {
        this.loadCandidatures();
        this.loadProjects();
    }

    get isAdmin(): boolean {
        const user = this.sessionService.getCurrentUser();
        return Boolean(user?.role === 'ADMIN' || user?.is_superuser);
    }

    get isClient(): boolean {
        return this.sessionService.getCurrentUser()?.role === 'CLIENT';
    }

    get isFreelancer(): boolean {
        return this.sessionService.getCurrentUser()?.role === 'FREELANCER';
    }

    get currentUserEmail(): string {
        return this.sessionService.getCurrentUser()?.email ?? '';
    }

    get filteredCandidatures(): Candidature[] {
        let items = [...this.candidatures];

        // Role-based filtering
        if (this.isFreelancer) {
            items = items.filter(c => c.email.toLowerCase() === this.currentUserEmail.toLowerCase());
        }

        if (this.statusFilter) {
            items = items.filter((c) => c.status === this.statusFilter);
        }

        if (this.searchTerm.trim()) {
            const term = this.searchTerm.trim().toLowerCase();
            items = items.filter((c) =>
                `${c.candidateName} ${c.email}`.toLowerCase().includes(term)
            );
        }

        return items.sort((a, b) => {
            switch (this.selectedSort) {
                case 'name-desc': return b.candidateName.localeCompare(a.candidateName);
                case 'status': return (a.status ?? '').localeCompare(b.status ?? '');
                case 'project': return (a.projectId ?? 0) - (b.projectId ?? 0);
                case 'name-asc':
                default: return a.candidateName.localeCompare(b.candidateName);
            }
        });
    }

    get totalCandidatures(): number { return this.candidatures.length; }

    get pendingCount(): number {
        return this.candidatures.filter((c) => c.status === 'PENDING').length;
    }

    get acceptedCount(): number {
        return this.candidatures.filter((c) => c.status === 'ACCEPTED').length;
    }

    get rejectedCount(): number {
        return this.candidatures.filter((c) =>
            c.status === 'REJECTED' || c.status === 'REJECTED_PROJECT_CLOSED'
        ).length;
    }

    loadCandidatures(): void {
        this.loading = true;
        this.errorMessage = '';

        this.candidaturesService.getAll()
            .pipe(finalize(() => { this.loading = false; }))
            .subscribe({
                next: (list) => {
                    this.candidatures = list ?? [];

                    if (this.selectedCandidature?.id) {
                        this.selectedCandidature = this.candidatures.find(
                            (c) => c.id === this.selectedCandidature?.id
                        ) ?? null;
                    }

                    if (!this.selectedCandidature && this.candidatures.length) {
                        this.selectedCandidature = this.candidatures[0];
                    }
                },
                error: (err: HttpErrorResponse) => {
                    this.errorMessage = this.extractErrorMessage(err, 'Unable to load candidatures. Check the gateway and candidature service.');
                }
            });
    }

    loadProjects(): void {
        this.projectsService.getAll().subscribe({
            next: (list) => { this.projects = list ?? []; },
            error: () => { this.projects = []; }
        });
    }

    refreshData(): void {
        this.successMessage = '';
        this.errorMessage = '';
        this.loadCandidatures();
        this.loadProjects();
    }

    selectCandidature(c: Candidature): void {
        this.selectedCandidature = c;
    }

    openCreate(): void {
        this.isEditMode = false;
        const user = this.sessionService.getCurrentUser();
        this.formCandidature = {
            candidateName: user ? `${user.first_name} ${user.last_name}`.trim() || user.username : '',
            email: user?.email ?? '',
            projectId: this.projects.length ? this.projects[0].id ?? null : null
        };
        this.formSubmitted = false;
        this.isFormOpen = true;
        this.clearMessages();
    }

    openEdit(c: Candidature): void {
        this.isEditMode = true;
        this.formCandidature = {
            id: c.id,
            candidateName: c.candidateName,
            email: c.email,
            projectId: c.projectId
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

    saveCandidature(form: NgForm): void {
        this.formSubmitted = true;

        if (form.invalid || !this.isValidForm()) {
            form.control.markAllAsTouched();
            return;
        }

        this.saving = true;
        this.clearMessages();

        const payload: Candidature = {
            candidateName: this.formCandidature.candidateName.trim(),
            email: this.formCandidature.email.trim().toLowerCase(),
            projectId: Number(this.formCandidature.projectId)
        };

        const request = this.isEditMode && this.formCandidature.id
            ? this.candidaturesService.update(this.formCandidature.id, payload)
            : this.candidaturesService.create(payload);

        request
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe({
                next: () => {
                    this.successMessage = this.isEditMode
                        ? 'Application updated successfully.'
                        : 'Application submitted successfully.';
                    this.isFormOpen = false;
                    this.formSubmitted = false;
                    this.loadCandidatures();
                },
                error: (err: HttpErrorResponse) => {
                    this.errorMessage = this.extractErrorMessage(err, 'Unable to save the application right now.');
                }
            });
    }

    quickUpdateStatus(c: Candidature, status: string): void {
        if (!c.id) return;

        this.updatingStatusId = c.id;
        this.clearMessages();

        this.candidaturesService.updateStatus(c.id, status)
            .pipe(finalize(() => { this.updatingStatusId = undefined; }))
            .subscribe({
                next: (updated) => {
                    this.successMessage = `Status updated to "${status}".`;
                    const idx = this.candidatures.findIndex((item) => item.id === c.id);
                    if (idx !== -1) {
                        this.candidatures[idx] = updated;
                        if (this.selectedCandidature?.id === updated.id) {
                            this.selectedCandidature = updated;
                        }
                    }
                },
                error: (err: HttpErrorResponse) => {
                    this.errorMessage = this.extractErrorMessage(err, 'Status update failed.');
                }
            });
    }

    acceptApp(c: Candidature): void {
        this.quickUpdateStatus(c, 'ACCEPTED');
    }

    rejectApp(c: Candidature): void {
        this.quickUpdateStatus(c, 'REJECTED');
    }

    withdrawApp(c: Candidature): void {
        if (!c.id || !window.confirm('Are you sure you want to withdraw this application?')) return;

        this.deletingId = c.id;
        this.clearMessages();

        this.candidaturesService.delete(c.id)
            .pipe(finalize(() => { this.deletingId = undefined; }))
            .subscribe({
                next: () => {
                    this.successMessage = 'Application withdrawn successfully.';
                    this.candidatures = this.candidatures.filter(item => item.id !== c.id);
                    if (this.selectedCandidature?.id === c.id) {
                        this.selectedCandidature = this.candidatures[0] ?? null;
                    }
                },
                error: (err: HttpErrorResponse) => {
                    this.errorMessage = this.extractErrorMessage(err, 'Failed to withdraw application.');
                }
            });
    }

    deleteCandidature(c: Candidature): void {
        if (!c.id || !window.confirm(`Delete the application from "${c.candidateName}"?`)) {
            return;
        }

        this.deletingId = c.id;
        this.clearMessages();

        this.candidaturesService.delete(c.id)
            .pipe(finalize(() => { this.deletingId = undefined; }))
            .subscribe({
                next: () => {
                    this.successMessage = 'Application deleted successfully.';
                    this.candidatures = this.candidatures.filter((item) => item.id !== c.id);
                    if (this.selectedCandidature?.id === c.id) {
                        this.selectedCandidature = this.candidatures[0] ?? null;
                    }
                },
                error: (err: HttpErrorResponse) => {
                    this.errorMessage = this.extractErrorMessage(err, 'Unable to delete the application right now.');
                }
            });
    }

    projectTitle(projectId: number): string {
        return this.projects.find((p) => p.id === projectId)?.title ?? `#${projectId}`;
    }

    statusLabel(status?: string): string {
        switch (status) {
            case 'ACCEPTED': return 'Accepted';
            case 'REJECTED': return 'Rejected';
            case 'REJECTED_PROJECT_CLOSED': return 'Project Closed';
            case 'PENDING':
            default: return 'Pending';
        }
    }

    statusClass(status?: string): string {
        switch (status) {
            case 'ACCEPTED': return 'status-accepted';
            case 'REJECTED': return 'status-rejected';
            case 'REJECTED_PROJECT_CLOSED': return 'status-closed';
            case 'PENDING':
            default: return 'status-pending';
        }
    }

    shouldShowError(model: NgModel): boolean {
        return Boolean(model.invalid && (model.touched || this.formSubmitted));
    }

    hasError(model: NgModel, errorKey: string): boolean {
        return this.shouldShowError(model) && Boolean(model.errors?.[errorKey]);
    }

    trackById(_index: number, c: Candidature): number | undefined {
        return c.id;
    }

    private isValidForm(): boolean {
        return Boolean(this.formCandidature.candidateName.trim())
            && Boolean(this.formCandidature.email.trim())
            && Boolean(this.formCandidature.projectId);
    }

    private createEmpty(): CandidatureFormValue {
        return { candidateName: '', email: '', projectId: null };
    }

    private clearMessages(): void {
        this.errorMessage = '';
        this.successMessage = '';
    }

    private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
        if (typeof error.error === 'string' && error.error.trim()) {
            return error.error;
        }
        if (error.error?.message) {
            return error.error.message;
        }
        return fallback;
    }
}
