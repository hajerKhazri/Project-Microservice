import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AvisService, Avis } from '../avis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-avis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-avis.component.html',
  styleUrls: ['./add-avis.component.scss']
})
export class AddAvisComponent {
  avis: Avis = {
    clientName: '',
    comment: '',
    score: 5,
    freelancerId: 0,
    freelancerName: '',
    projectName: '',
    isAnonymous: false,
    evaluatorName: ''
  };

  constructor(private service: AvisService, private router: Router) {}

  addAvis() {
    // Validation simple
    if (!this.avis.projectName || this.avis.projectName.trim() === '') {
      Swal.fire('Erreur', 'Le nom du projet est requis', 'warning');
      return;
    }
    if (!this.avis.freelancerName || this.avis.freelancerName.trim() === '') {
      Swal.fire('Erreur', 'Le nom du freelance est requis', 'warning');
      return;
    }
    if (!this.avis.clientName || this.avis.clientName.trim() === '') {
      Swal.fire('Erreur', "L'email de l'évaluateur est requis", 'warning');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.avis.clientName)) {
      Swal.fire('Erreur', 'Email invalide (ex: nom@domaine.com)', 'warning');
      return;
    }
    if (!this.avis.evaluatorName || this.avis.evaluatorName.trim() === '') {
      Swal.fire('Erreur', 'Votre nom est requis', 'warning');
      return;
    }
    if (!this.avis.comment || this.avis.comment.trim() === '') {
      Swal.fire('Erreur', 'Le commentaire est requis', 'warning');
      return;
    }

    this.service.addAvis(this.avis).subscribe({
      next: () => {
        Swal.fire('Succès', 'Avis ajouté avec succès', 'success');
        this.router.navigate(['/avis']);
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', "Échec de l'ajout de l'avis", 'error');
      }
    });
  }

  setNote(note: number) {
    this.avis.score = note;
  }
}