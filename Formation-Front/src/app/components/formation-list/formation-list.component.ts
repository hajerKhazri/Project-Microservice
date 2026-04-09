import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Formation, StatutFormation } from '../../models/formation.model';
import { FormationService } from '../../services/formation.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-formation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './formation-list.component.html',
  styleUrl: './formation-list.component.css'
})
export class FormationListComponent implements OnInit {
  formations: Formation[] = [];
  displayedColumns = ['titre', 'statut', 'avancement', 'dateDebut', 'dateFin', 'actions'];
  loading = true;

  constructor(
    private formationService: FormationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.loading = true;
    this.formationService.getAll().subscribe({
      next: (data) => {
        this.formations = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement des formations', 'Fermer', {
          duration: 4000,
          panelClass: 'snack-error'
        });
      }
    });
  }

  deleteFormation(formation: Formation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Supprimer la formation "${formation.titre}" ?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && formation.id) {
        this.formationService.delete(formation.id).subscribe({
          next: () => {
            this.formations = this.formations.filter(f => f.id !== formation.id);
            this.snackBar.open('Formation supprimée avec succès', 'Fermer', {
              duration: 3000,
              panelClass: 'snack-success'
            });
          },
          error: () => this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 4000,
            panelClass: 'snack-error'
          })
        });
      }
    });
  }

  getStatutLabel(statut: StatutFormation): string {
    switch (statut) {
      case StatutFormation.PLANIFIE: return 'Planifié';
      case StatutFormation.EN_COURS: return 'En cours';
      case StatutFormation.TERMINE: return 'Terminé';
      default: return statut;
    }
  }

  getProgressColor(avancement: number): 'primary' | 'accent' | 'warn' {
    if (avancement >= 75) return 'primary';
    if (avancement >= 40) return 'accent';
    return 'warn';
  }
}