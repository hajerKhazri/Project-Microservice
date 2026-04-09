import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FichierFormation } from '../../models/formation.model';
import { FichierService } from '../../services/fichier.service';

@Component({
  selector: 'app-fichier-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './fichier-manager.component.html',
  styleUrl: './fichier-manager.component.css'
})
export class FichierManagerComponent implements OnInit {
  @Input() formationId!: number;

  fichiers: FichierFormation[] = [];
  uploading = false;

  constructor(
    private fichierService: FichierService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFichiers();
  }

  loadFichiers(): void {
    this.fichierService.list(this.formationId).subscribe({
      next: (data: FichierFormation[]) => {
        this.fichiers = data;
      },
      error: () => {
        this.snackBar.open('Erreur chargement fichiers', 'Fermer', { duration: 3000 });
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.uploading = true;

    this.fichierService.upload(this.formationId, file).subscribe({
      next: () => {
        this.uploading = false;
        this.loadFichiers();
        this.snackBar.open('Fichier uploadé', 'Fermer', { duration: 3000 });
        input.value = '';
      },
      error: () => {
        this.uploading = false;
        this.snackBar.open('Erreur upload', 'Fermer', { duration: 3000 });
      }
    });
  }

  downloadFichier(fichier: FichierFormation): void {
    this.fichierService.download(this.formationId, fichier.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fichier.nomFichier;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('Erreur téléchargement', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteFichier(fichier: FichierFormation): void {
    this.fichierService.delete(this.formationId, fichier.id).subscribe({
      next: () => {
        this.loadFichiers();
        this.snackBar.open('Fichier supprimé', 'Fermer', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Erreur suppression', 'Fermer', { duration: 3000 });
      }
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  getFileIcon(type: string): string {
    if (!type) return 'insert_drive_file';
    if (type.startsWith('image/')) return 'image';
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('video')) return 'video_file';
    if (type.includes('audio')) return 'audio_file';
    return 'insert_drive_file';
  }
}