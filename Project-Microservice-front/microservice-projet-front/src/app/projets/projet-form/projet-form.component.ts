import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjetService } from '../../services/projet.service';
import { Projet } from '../../models/projet.model';

@Component({
  selector: 'app-projet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './projet-form.component.html',
  styleUrls: ['./projet-form.component.css']
})
export class ProjetFormComponent implements OnInit {
  projetForm!: FormGroup;
  submitted = false;
  isEditMode = false;
  projetId!: number;
  errorMessage = '';

  domaines: string[] = [
    'WEB',
    'MOBILE',
    'DESKTOP',
    'DATA_SCIENCE',
    'IA',
    'DEVOPS',
    'CYBERSECURITY',
    'CLOUD_COMPUTING',
    'GAME_DEV',
    'IOT',
    'BIG_DATA',
    'BLOCKCHAIN'
  ];

  constructor(
    private fb: FormBuilder,
    private projetService: ProjetService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.projetForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(4), this.firstLetterUppercaseValidator]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      date: ['', Validators.required],
      domaine: ['', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.projetId = +id;
      this.loadProjet(this.projetId);
    }
  }

  get f() {
    return this.projetForm.controls;
  }

  firstLetterUppercaseValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value || value.trim().length === 0) return null;
    return /^[A-Z]/.test(value.trim()) ? null : { firstLetterUppercase: true };
  }

  loadProjet(id: number): void {
    this.projetService.getProjetById(id).subscribe({
      next: (projet) => {
        this.projetForm.patchValue(projet);
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le projet.';
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.projetForm.invalid) {
      this.projetForm.markAllAsTouched();
      return;
    }

    const projet: Projet = this.projetForm.value;

    if (this.isEditMode) {
      this.projetService.updateProjet(this.projetId, projet).subscribe({
        next: () => this.router.navigate(['/projets']),
        error: (err) => {
          this.errorMessage = err.error || 'Erreur lors de la modification.';
        }
      });
    } else {
      this.projetService.addProjet(projet).subscribe({
        next: () => this.router.navigate(['/projets']),
        error: (err) => {
          this.errorMessage = err.error || 'Erreur lors de l’ajout.';
        }
      });
    }
  }
}
