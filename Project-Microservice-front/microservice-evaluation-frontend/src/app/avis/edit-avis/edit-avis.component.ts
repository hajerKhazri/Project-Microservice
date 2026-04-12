import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AvisService, Avis } from '../avis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-avis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-avis.component.html',
  styleUrls: ['./edit-avis.component.scss']
})
export class EditAvisComponent implements OnInit {
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
  id!: number;

  constructor(
    private route: ActivatedRoute,
    private service: AvisService,
    private router: Router
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getAvisById(this.id).subscribe({
      next: (data) => {
        this.avis = data;
      },
      error: () => {
        Swal.fire('Erreur', 'Avis introuvable', 'error');
        this.router.navigate(['/avis']);
      }
    });
  }

  updateAvis() {
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

    this.service.updateAvis(this.id, this.avis).subscribe({
      next: () => {
        Swal.fire('Succès', 'Avis mis à jour', 'success');
        this.router.navigate(['/avis']);
      },
      error: () => Swal.fire('Erreur', 'Échec de la mise à jour', 'error')
    });
  }

  setNote(note: number) {
    this.avis.score = note;
  }
}