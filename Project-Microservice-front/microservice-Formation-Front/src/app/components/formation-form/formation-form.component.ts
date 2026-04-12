import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Formation, StatutFormation } from '../../models/formation.model';
import { FormationService } from '../../services/formation.service';

@Component({
  selector: 'app-formation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './formation-form.component.html',
  styleUrl: './formation-form.component.css'
})
export class FormationFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  formationId?: number;
  statuts = Object.values(StatutFormation);

  constructor(
    private fb: FormBuilder,
    private formationService: FormationService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      titre: ['', [Validators.required, Validators.maxLength(180)]],
      description: ['', Validators.maxLength(4000)],
      dateDebut: [null],
      dateFin: [null],
      statut: [StatutFormation.PLANIFIE, Validators.required],
      avancement: [0, [Validators.min(0), Validators.max(100)]]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.formationId = +id;

      this.formationService.getById(this.formationId).subscribe({
        next: (formation) => {
          this.form.patchValue({
            titre: formation.titre,
            description: formation.description,
            dateDebut: formation.dateDebut ? new Date(formation.dateDebut) : null,
            dateFin: formation.dateFin ? new Date(formation.dateFin) : null,
            statut: formation.statut,
            avancement: formation.avancement
          });
        },
        error: () => this.snackBar.open('Formation introuvable', 'Fermer', { duration: 3000 })
      });
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'PLANIFIE': return 'Planifié';
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminé';
      default: return statut;
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const rawValue = this.form.value;

    const formation: Formation = {
      titre: rawValue.titre,
      description: rawValue.description,
      dateDebut: rawValue.dateDebut ? this.formatDate(rawValue.dateDebut) : undefined,
      dateFin: rawValue.dateFin ? this.formatDate(rawValue.dateFin) : undefined,
      statut: rawValue.statut,
      avancement: rawValue.avancement
    };

    if (this.isEdit && this.formationId) {
      this.formationService.update(this.formationId, formation).subscribe({
        next: () => {
          this.snackBar.open('Formation mise à jour avec succès', 'Fermer', {
            duration: 3000,
            panelClass: 'snack-success'
          });
          this.router.navigate(['/formations', this.formationId]);
        },
        error: () => this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', {
          duration: 4000,
          panelClass: 'snack-error'
        })
      });
    } else {
      this.formationService.create(formation).subscribe({
        next: (created) => {
          this.snackBar.open('Formation créée avec succès', 'Fermer', {
            duration: 3000,
            panelClass: 'snack-success'
          });
          this.router.navigate(['/formations', created.id]);
        },
        error: () => this.snackBar.open('Erreur lors de la création', 'Fermer', {
          duration: 4000,
          panelClass: 'snack-error'
        })
      });
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}