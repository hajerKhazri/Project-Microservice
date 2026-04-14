import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  CERTIFICATE_TYPES,
  CertificateStatus,
  CertificateType,
  Skill,
  SkillBadge,
  SkillLevel,
  SkillPayload,
  SKILL_LEVELS
} from '../../models/skill.model';
import { SkillsService } from '../../services/skills.service';

type SortField = 'id' | 'name' | 'level' | 'yearsOfExperience' | 'score' | 'certificateStatus' | 'badge';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  providers: [DatePipe],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css'
})
export class SkillsComponent implements OnInit {
  readonly levels = SKILL_LEVELS;
  readonly certificateTypes = CERTIFICATE_TYPES;

  skills: Skill[] = [];
  searchTerm = '';
  sortField: SortField = 'score';
  sortDirection: SortDirection = 'desc';
  scoreboardDirection: SortDirection = 'desc';
  page = 1;
  readonly pageSize = 3;
  isDarkMode = true;

  loading = false;
  saving = false;
  deletingId?: number;
  errorMessage = '';
  successMessage = '';

  isFormOpen = false;
  isEditMode = false;
  isScoreboardOpen = false;
  formSubmitted = false;
  formSkill: Skill = this.createEmptySkill();

  constructor(
    private readonly skillsService: SkillsService,
    private readonly datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.restoreThemePreference();
    this.loadSkills();
  }

  get filteredSkills(): Skill[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.skills;
    }

    return this.skills.filter((skill) =>
      [
        skill.name,
        skill.level,
        skill.badge,
        skill.certificateType,
        skill.certificateStatus,
        skill.certificateName,
        skill.score,
        skill.yearsOfExperience,
        skill.description
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }

  get sortedSkills(): Skill[] {
    const direction = this.sortDirection === 'asc' ? 1 : -1;

    return [...this.filteredSkills].sort((a, b) => {
      const left = this.getSortValue(a);
      const right = this.getSortValue(b);

      if (left < right) {
        return -1 * direction;
      }

      if (left > right) {
        return 1 * direction;
      }

      return 0;
    });
  }

  get pagedSkills(): Skill[] {
    const start = (this.page - 1) * this.pageSize;
    return this.sortedSkills.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.sortedSkills.length / this.pageSize));
  }

  get totalSkillsLabel(): string {
    return `${this.filteredSkills.length} skill${this.filteredSkills.length === 1 ? '' : 's'}`;
  }

  get scoreboardSkills(): Skill[] {
    const direction = this.scoreboardDirection === 'asc' ? 1 : -1;

    return [...this.filteredSkills].sort((a, b) => {
      if (a.score !== b.score) {
        return (a.score - b.score) * direction;
      }

      if (a.yearsOfExperience !== b.yearsOfExperience) {
        return (a.yearsOfExperience - b.yearsOfExperience) * direction;
      }

      return a.name.localeCompare(b.name) * direction;
    });
  }

  loadSkills(): void {
    this.loading = true;
    this.errorMessage = '';

    this.skillsService.getAll()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (skills) => {
          this.skills = (skills ?? []).map((skill) => this.normalizeSkill(skill));
          this.normalizePage();
        },
        error: () => {
          this.errorMessage = 'Cannot load skills. Check Eureka, gateway and skills-service.';
        }
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.page = 1;
  }

  onSortFieldChange(value: string): void {
    if (
      value === 'id'
      || value === 'name'
      || value === 'level'
      || value === 'yearsOfExperience'
      || value === 'score'
      || value === 'certificateStatus'
      || value === 'badge'
    ) {
      this.sortField = value;
      this.page = 1;
    }
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.page = 1;
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page -= 1;
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page += 1;
    }
  }

  openCreate(): void {
    this.isEditMode = false;
    this.formSkill = this.createEmptySkill();
    this.isFormOpen = true;
    this.formSubmitted = false;
    this.clearMessages();
  }

  openEdit(skill: Skill): void {
    this.isEditMode = true;
    this.formSkill = {
      ...skill,
      certificateExpiresAt: skill.certificateExpiresAt ?? null
    };
    this.isFormOpen = true;
    this.formSubmitted = false;
    this.clearMessages();
  }

  closeForm(): void {
    if (!this.saving) {
      this.isFormOpen = false;
      this.formSubmitted = false;
    }
  }

  saveSkill(skillForm: NgForm): void {
    this.formSubmitted = true;

    if (skillForm.invalid || !this.isValidSkill(this.formSkill)) {
      skillForm.control.markAllAsTouched();
      this.errorMessage = '';
      this.successMessage = '';
      return;
    }

    this.saving = true;
    this.clearMessages();

    const payload: SkillPayload = {
      id: this.formSkill.id,
      name: this.formSkill.name.trim(),
      level: this.formSkill.level,
      yearsOfExperience: Number(this.formSkill.yearsOfExperience),
      description: (this.formSkill.description ?? '').trim(),
      certificateType: this.formSkill.certificateType,
      certificateName: this.formSkill.certificateType === 'NONE'
        ? null
        : (this.formSkill.certificateName?.trim() || null),
      certificateExpiresAt: this.formSkill.certificateType === 'NONE'
        ? null
        : (this.formSkill.certificateExpiresAt || null)
    };

    const request = this.isEditMode ? this.skillsService.update(payload) : this.skillsService.create(payload);

    request
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe({
        next: () => {
          this.successMessage = this.isEditMode ? 'Skill updated successfully.' : 'Skill added successfully.';
          this.isFormOpen = false;
          this.formSubmitted = false;
          this.loadSkills();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Save failed. Check the gateway route and backend service.');
        }
      });
  }

  deleteSkill(skill: Skill): void {
    if (!skill.id) {
      return;
    }

    this.deletingId = skill.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.skillsService.delete(skill.id)
      .pipe(finalize(() => {
        this.deletingId = undefined;
      }))
      .subscribe({
        next: () => {
          this.skills = this.skills.filter((item) => item.id !== skill.id);
          this.normalizePage();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Delete failed. Check the backend service.');
        }
      });
  }

  refreshData(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.loadSkills();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('skills-theme', this.isDarkMode ? 'dark' : 'light');
  }

  openScoreboard(): void {
    this.isScoreboardOpen = !this.isScoreboardOpen;
    this.sortField = 'score';
    this.sortDirection = 'desc';
    this.scoreboardDirection = 'desc';
    this.page = 1;
    this.successMessage = '';
    this.errorMessage = '';
  }

  setScoreboardDirection(direction: SortDirection): void {
    this.scoreboardDirection = direction;
    this.sortField = 'score';
    this.sortDirection = direction;
    this.page = 1;
  }

  printSkill(skill: Skill): void {
    const printWindow = window.open('', '_blank', 'width=720,height=900');

    if (!printWindow) {
      this.errorMessage = 'Popup blocked. Allow popups to print the skill card.';
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${this.escapeHtml(skill.name)} - Skill</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0b1b2a; }
            .card { border: 1px solid #d7e3f2; border-radius: 18px; padding: 24px; }
            h1 { margin-top: 0; color: #0b2440; }
            .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
            .box { background: #edf5ff; border-radius: 12px; padding: 14px; }
            .label { display: block; color: #577089; font-size: 12px; font-weight: 700; }
            strong { font-size: 20px; }
            .section { margin-top: 18px; }
            .section h2 { margin-bottom: 10px; color: #0b2440; font-size: 18px; }
            .row { margin: 6px 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${this.escapeHtml(skill.name)}</h1>
            <div class="meta">
              <div class="box"><span class="label">Skill ID</span><strong>${this.escapeHtml(skill.id ?? '-')}</strong></div>
              <div class="box"><span class="label">Score</span><strong>${this.escapeHtml(skill.score)}</strong></div>
              <div class="box"><span class="label">Badge</span><strong>${this.escapeHtml(this.badgeLabel(skill.badge))}</strong></div>
            </div>
            <div class="section">
              <h2>Skill details</h2>
              <div class="row"><strong>Level:</strong> ${this.escapeHtml(this.levelLabel(skill.level))}</div>
              <div class="row"><strong>Years of experience:</strong> ${this.escapeHtml(skill.yearsOfExperience)}</div>
              <div class="row"><strong>Description:</strong> ${this.escapeHtml(skill.description || 'No description provided.')}</div>
            </div>
            <div class="section">
              <h2>Certificate</h2>
              <div class="row"><strong>Type:</strong> ${this.escapeHtml(this.certificateTypeLabel(skill.certificateType))}</div>
              <div class="row"><strong>Name:</strong> ${this.escapeHtml(skill.certificateName || 'No certificate')}</div>
              <div class="row"><strong>Status:</strong> ${this.escapeHtml(this.certificateStatusLabel(skill.certificateStatus))}</div>
              <div class="row"><strong>Expires at:</strong> ${this.escapeHtml(this.formatDate(skill.certificateExpiresAt) || 'No expiration date')}</div>
            </div>
            <div class="section">
              <h2>Next target</h2>
              <div class="row">${this.escapeHtml(skill.nextBadgeTarget || 'No progression target available.')}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  levelLabel(level: SkillLevel): string {
    const labels: Record<SkillLevel, string> = {
      BEGINNER: 'Beginner',
      INTERMEDIATE: 'Intermediate',
      ADVANCED: 'Advanced',
      EXPERT: 'Expert'
    };

    return labels[level];
  }

  levelBadgeClass(level: SkillLevel): string {
    return `level-${level.toLowerCase()}`;
  }

  badgeLabel(badge: SkillBadge): string {
    const labels: Record<SkillBadge, string> = {
      BEGINNER: 'Beginner',
      ADVANCED: 'Advanced',
      EXPERT: 'Expert',
      CERTIFIED_EXPERT: 'Certified Expert'
    };

    return labels[badge];
  }

  badgeClass(badge: SkillBadge): string {
    return `badge-${badge.toLowerCase()}`;
  }

  medalClass(badge: SkillBadge): string {
    return `medal-${badge.toLowerCase()}`;
  }

  certificateTypeLabel(certificateType: CertificateType): string {
    const labels: Record<CertificateType, string> = {
      NONE: 'No certificate',
      CERTIFICATE: 'Certificate',
      DIPLOMA: 'Diploma'
    };

    return labels[certificateType];
  }

  certificateStatusLabel(certificateStatus: CertificateStatus): string {
    const labels: Record<CertificateStatus, string> = {
      NO_CERTIFICATE: 'No certificate',
      VALID: 'Valid',
      EXPIRING_SOON: 'Expiring soon',
      EXPIRED: 'Expired'
    };

    return labels[certificateStatus];
  }

  certificateStatusClass(certificateStatus: CertificateStatus): string {
    return `status-${certificateStatus.toLowerCase()}`;
  }

  formatDate(value: string | null): string | null {
    if (!value) {
      return null;
    }

    return this.datePipe.transform(value, 'dd/MM/yyyy');
  }

  rankFor(skill: Skill): number {
    const ranked = [...this.skills].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return b.yearsOfExperience - a.yearsOfExperience;
    });
    return Math.max(1, ranked.findIndex((item) => item.id === skill.id) + 1);
  }

  onCertificateTypeChange(certificateType: CertificateType): void {
    this.formSkill.certificateType = certificateType;

    if (certificateType === 'NONE') {
      this.formSkill.certificateName = null;
      this.formSkill.certificateExpiresAt = null;
    }
  }

  shouldShowError(model: NgModel): boolean {
    return Boolean(model.invalid && (model.touched || this.formSubmitted));
  }

  hasError(model: NgModel, errorKey: string): boolean {
    return this.shouldShowError(model) && Boolean(model.errors?.[errorKey]);
  }

  trackBySkillId(_index: number, skill: Skill): number | string {
    return skill.id ?? skill.name;
  }

  private getSortValue(skill: Skill): number | string {
    switch (this.sortField) {
      case 'id':
        return skill.id ?? 0;
      case 'yearsOfExperience':
        return skill.yearsOfExperience ?? 0;
      case 'score':
        return skill.score ?? 0;
      case 'certificateStatus':
        return this.certificateStatusPriority(skill.certificateStatus);
      case 'badge':
        return this.badgePriority(skill.badge);
      case 'level':
        return skill.level ?? '';
      case 'name':
        return (skill.name ?? '').toLowerCase();
    }
  }

  private normalizeSkill(skill: Skill): Skill {
    return {
      ...skill,
      name: skill.name ?? '',
      level: skill.level ?? 'BEGINNER',
      yearsOfExperience: Number(skill.yearsOfExperience ?? 0),
      description: skill.description ?? '',
      certificateType: skill.certificateType ?? 'NONE',
      certificateName: skill.certificateName ?? null,
      certificateExpiresAt: skill.certificateExpiresAt ?? null,
      certificateStatus: skill.certificateStatus ?? 'NO_CERTIFICATE',
      score: Number(skill.score ?? 0),
      badge: skill.badge ?? 'BEGINNER',
      nextBadgeTarget: skill.nextBadgeTarget ?? 'No progression target available.'
    };
  }

  private normalizePage(): void {
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
  }

  private createEmptySkill(): Skill {
    return {
      name: '',
      level: 'BEGINNER',
      yearsOfExperience: 0,
      description: '',
      certificateType: 'NONE',
      certificateName: null,
      certificateExpiresAt: null,
      certificateStatus: 'NO_CERTIFICATE',
      score: 0,
      badge: 'BEGINNER',
      nextBadgeTarget: ''
    };
  }

  private isValidSkill(skill: Skill): boolean {
    const hasValidCertificateName = skill.certificateType === 'NONE' || Boolean(skill.certificateName?.trim());

    return Boolean(skill.name?.trim())
      && Boolean(skill.level)
      && Number(skill.yearsOfExperience) >= 0
      && hasValidCertificateName;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private escapeHtml(value: string | number): string {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private badgePriority(badge: SkillBadge): number {
    const priorities: Record<SkillBadge, number> = {
      BEGINNER: 1,
      ADVANCED: 2,
      EXPERT: 3,
      CERTIFIED_EXPERT: 4
    };

    return priorities[badge];
  }

  private certificateStatusPriority(status: CertificateStatus): number {
    const priorities: Record<CertificateStatus, number> = {
      NO_CERTIFICATE: 1,
      EXPIRED: 2,
      EXPIRING_SOON: 3,
      VALID: 4
    };

    return priorities[status];
  }

  private extractErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    return error.error?.message || fallbackMessage;
  }

  private restoreThemePreference(): void {
    const savedTheme = localStorage.getItem('skills-theme');

    if (savedTheme === 'light') {
      this.isDarkMode = false;
    }
  }
}
