import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { AvisService, Avis } from '../avis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-avis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './list-avis.component.html',
  styleUrls: ['./list-avis.component.scss']
})
export class ListAvisComponent implements OnInit {
  avisList: Avis[] = [];
  filteredAvis: Avis[] = [];
  searchTerm: string = '';
  selectedScore: string = 'All Scores';
  scores: string[] = ['All Scores', '5', '4', '3', '2', '1'];
  loading: boolean = false;

  constructor(private avisService: AvisService, private router: Router) {}

  ngOnInit(): void {
    this.loadAvis();
  }

  loadAvis() {
    this.loading = true;
    this.avisService.getAvis().subscribe({
      next: (data: Avis[]) => {
        this.avisList = data;
        this.filteredAvis = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire('Error', 'Failed to load reviews', 'error');
        this.loading = false;
      }
    });
  }

  filterAvis() {
    let filtered = this.avisList;
    if (this.selectedScore !== 'All Scores') {
      const scoreVal = parseInt(this.selectedScore);
      filtered = filtered.filter(a => a.score === scoreVal);
    }
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(a =>
        (a.evaluatorName && a.evaluatorName.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        a.clientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        a.comment.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.filteredAvis = filtered;
  }

  onSearchChange() {
    this.filterAvis();
  }

  onScoreChange(score: string) {
    this.selectedScore = score;
    this.filterAvis();
  }

  deleteAvis(id: number | undefined) {
    if (!id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f97316',     // orange comme dans l'exemple
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.avisService.deleteAvis(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Review has been deleted.',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadAvis(); // recharge la liste
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Could not delete review.'
            });
          }
        });
      }
    });
  }

  editAvis(id: number | undefined) {
    if (id) this.router.navigate(['/avis/edit', id]);
  }

  addAvis() {
    this.router.navigate(['/avis/add']);
  }

  getStars(score: number): string[] {
    const fullStars = Math.floor(score);
    const stars = [];
    for (let i = 0; i < fullStars; i++) stars.push('⭐');
    for (let i = stars.length; i < 5; i++) stars.push('☆');
    return stars;
  }
}