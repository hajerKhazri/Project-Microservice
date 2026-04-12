import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  FORMATION_STATUSES,
  Formation,
  FormationFile,
  FormationStats,
  FormationStatus
} from '../../models/formation.model';
import { FormationFilesService } from '../../services/formation-files.service';
import { FormationsService } from '../../services/formations.service';

interface FormationFormValue {
  id?: number;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  statut: FormationStatus;
  avancement: number;
}

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './formations.component.html',
  styleUrl: './formations.component.css'
})
export class FormationsComponent implements OnInit {
  readonly statuses = FORMATION_STATUSES;

  formations: Formation[] = [];
  selectedFormation: Formation | null = null;
  selectedFormationFiles: FormationFile[] = [];
  stats: FormationStats | null = null;

  searchTerm = '';
  selectedStatus = '';
  selectedUploadFile: File | null = null;

  loading = false;
  statsLoading = false;
  saving = false;
  uploading = false;
  deletingId?: number;
  deletingFileId?: number;
  errorMessage = '';
  successMessage = '';

  isFormOpen = false;
  isEditMode = false;
  formSubmitted = false;
  formFormation: FormationFormValue = this.createEmptyFormation();

  constructor(
    private readonly formationsService: FormationsService,
    private readonly formationFilesService: FormationFilesService,
    private readonly datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadFormations();
    this.loadStats();
  }

  get filteredFormations(): Formation[] {
    let items = [...this.formations];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      items = items.filter((formation) =>
        `${formation.titre} ${formation.description ?? ''}`.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus) {
      items = items.filter((formation) => formation.statut === this.selectedStatus);
    }

    return items.sort((left, right) => {
      const leftDate = new Date(left.dateDebut ?? left.createdAt ?? 0).getTime();
      const rightDate = new Date(right.dateDebut ?? right.createdAt ?? 0).getTime();
      return rightDate - leftDate;
    });
  }

  loadFormations(): void {
    this.loading = true;
    this.errorMessage = '';

    this.formationsService.getAll()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (formations) => {
          this.formations = formations ?? [];

          if (this.selectedFormation?.id) {
            const refreshed = this.formations.find((item) => item.id === this.selectedFormation?.id) ?? null;
            this.selectedFormation = refreshed;

            if (refreshed?.id) {
              this.loadFiles(refreshed.id);
            }
          } else if (this.formations.length) {
            this.selectFormation(this.formations[0]);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Unable to load formations. Check the gateway and formation service.');
        }
      });
  }

  loadStats(): void {
    this.statsLoading = true;

    this.formationsService.getStats()
      .pipe(finalize(() => {
        this.statsLoading = false;
      }))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: () => {
          this.stats = null;
        }
      });
  }

  refreshData(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.loadFormations();
    this.loadStats();
  }

  selectFormation(formation: Formation): void {
    this.selectedFormation = formation;

    if (formation.id) {
      this.loadFiles(formation.id);
    }
  }

  openCreate(): void {
    this.isEditMode = false;
    this.formFormation = this.createEmptyFormation();
    this.formSubmitted = false;
    this.isFormOpen = true;
    this.clearMessages();
  }

  openEdit(formation: Formation): void {
    this.isEditMode = true;
    this.formFormation = {
      id: formation.id,
      titre: formation.titre,
      description: formation.description ?? '',
      dateDebut: formation.dateDebut ?? '',
      dateFin: formation.dateFin ?? '',
      statut: formation.statut,
      avancement: formation.avancement
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

  saveFormation(formationForm: NgForm): void {
    this.formSubmitted = true;

    if (formationForm.invalid || !this.isValidFormation(this.formFormation)) {
      formationForm.control.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.clearMessages();

    const payload: Formation = {
      titre: this.formFormation.titre.trim(),
      description: this.formFormation.description.trim(),
      dateDebut: this.formFormation.dateDebut || undefined,
      dateFin: this.formFormation.dateFin || undefined,
      statut: this.formFormation.statut,
      avancement: Number(this.formFormation.avancement)
    };

    const request = this.isEditMode && this.formFormation.id
      ? this.formationsService.update(this.formFormation.id, payload)
      : this.formationsService.create(payload);

    request
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe({
        next: (formation) => {
          this.successMessage = this.isEditMode ? 'Formation updated successfully.' : 'Formation created successfully.';
          this.isFormOpen = false;
          this.formSubmitted = false;
          this.loadFormations();

          if (formation.id) {
            this.selectFormation(formation);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Unable to save the formation right now.');
        }
      });
  }

  deleteFormation(formation: Formation): void {
    if (!formation.id || !window.confirm(`Delete formation "${formation.titre}"?`)) {
      return;
    }

    this.deletingId = formation.id;
    this.clearMessages();

    this.formationsService.delete(formation.id)
      .pipe(finalize(() => {
        this.deletingId = undefined;
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'Formation deleted successfully.';
          this.formations = this.formations.filter((item) => item.id !== formation.id);
          this.selectedFormation = this.selectedFormation?.id === formation.id ? (this.formations[0] ?? null) : this.selectedFormation;
          this.selectedFormationFiles = this.selectedFormation ? this.selectedFormationFiles : [];
          this.loadStats();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Unable to delete the formation right now.');
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedUploadFile = input.files?.[0] ?? null;
  }

  uploadFile(fileInput: HTMLInputElement): void {
    if (!this.selectedFormation?.id || !this.selectedUploadFile) {
      return;
    }

    this.uploading = true;
    this.clearMessages();

    this.formationFilesService.upload(this.selectedFormation.id, this.selectedUploadFile)
      .pipe(finalize(() => {
        this.uploading = false;
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'File uploaded successfully.';
          this.selectedUploadFile = null;
          fileInput.value = '';
          this.loadFiles(this.selectedFormation!.id!);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Unable to upload the file right now.');
        }
      });
  }

  downloadFile(file: FormationFile): void {
    if (!this.selectedFormation?.id) {
      return;
    }

    this.formationFilesService.download(this.selectedFormation.id, file.id)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = file.nomFichier;
          anchor.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.errorMessage = 'Unable to download the selected file.';
        }
      });
  }

  deleteFile(file: FormationFile): void {
    if (!this.selectedFormation?.id || !window.confirm(`Delete file "${file.nomFichier}"?`)) {
      return;
    }

    this.deletingFileId = file.id;
    this.clearMessages();

    this.formationFilesService.delete(this.selectedFormation.id, file.id)
      .pipe(finalize(() => {
        this.deletingFileId = undefined;
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'File deleted successfully.';
          this.selectedFormationFiles = this.selectedFormationFiles.filter((item) => item.id !== file.id);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Unable to delete the selected file.');
        }
      });
  }

  statusLabel(status: FormationStatus): string {
    const labels: Record<FormationStatus, string> = {
      PLANIFIE: 'Planned',
      EN_COURS: 'In progress',
      TERMINE: 'Completed'
    };

    return labels[status];
  }

  statusClass(status: FormationStatus): string {
    return `status-${status.toLowerCase()}`;
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Not set';
    }

    return this.datePipe.transform(value, 'dd/MM/yyyy') ?? value;
  }

  fileSizeLabel(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  progressStyle(formation: Formation): string {
    return `${Math.max(0, Math.min(100, formation.avancement))}%`;
  }

  shouldShowError(model: NgModel): boolean {
    return Boolean(model.invalid && (model.touched || this.formSubmitted));
  }

  hasError(model: NgModel, errorKey: string): boolean {
    return this.shouldShowError(model) && Boolean(model.errors?.[errorKey]);
  }

  private loadFiles(formationId: number): void {
    this.formationFilesService.list(formationId)
      .subscribe({
        next: (files) => {
          this.selectedFormationFiles = files ?? [];
        },
        error: () => {
          this.selectedFormationFiles = [];
        }
      });
  }

  private createEmptyFormation(): FormationFormValue {
    return {
      titre: '',
      description: '',
      dateDebut: '',
      dateFin: '',
      statut: 'PLANIFIE',
      avancement: 0
    };
  }

  private isValidFormation(formation: FormationFormValue): boolean {
    return Boolean(formation.titre.trim())
      && Number(formation.avancement) >= 0
      && Number(formation.avancement) <= 100;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private extractErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (error.error && typeof error.error === 'object') {
      const firstEntry = Object.entries(error.error)[0];

      if (firstEntry) {
        const [field, value] = firstEntry;
        const message = Array.isArray(value) ? value[0] : value;
        return `${field}: ${message}`;
      }
    }

    return fallbackMessage;
  }
}
