import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Formation, StatutFormation } from '../../models/formation.model';
import { FormationService } from '../../services/formation.service';
import { FichierManagerComponent } from '../fichier-manager/fichier-manager.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    FichierManagerComponent
  ],
  templateUrl: './formation-detail.component.html',
  styleUrl: './formation-detail.component.css'
})
export class FormationDetailComponent implements OnInit {
  formation?: Formation;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formationService: FormationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.formationService.getById(id).subscribe({
      next: (data) => this.formation = data,
      error: () => {
        this.snackBar.open('Formation introuvable', 'Fermer', { duration: 3000 });
        this.router.navigate(['/formations']);
      }
    });
  }

  getStatutLabel(statut: StatutFormation): string {
    switch (statut) {
      case StatutFormation.PLANIFIE:
        return 'Planifié';
      case StatutFormation.EN_COURS:
        return 'En cours';
      case StatutFormation.TERMINE:
        return 'Terminé';
      default:
        return statut;
    }
  }

  getProgressColor(avancement: number): 'primary' | 'accent' | 'warn' {
    if (avancement >= 75) return 'primary';
    if (avancement >= 40) return 'accent';
    return 'warn';
  }

  deleteFormation(): void {
    if (!this.formation) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Supprimer la formation "${this.formation.titre}" ?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.formation?.id) {
        this.formationService.delete(this.formation.id).subscribe({
          next: () => {
            this.snackBar.open('Formation supprimée avec succès', 'Fermer', {
              duration: 3000,
              panelClass: 'snack-success'
            });
            this.router.navigate(['/formations']);
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
              duration: 4000,
              panelClass: 'snack-error'
            });
          }
        });
      }
    });
  }
}