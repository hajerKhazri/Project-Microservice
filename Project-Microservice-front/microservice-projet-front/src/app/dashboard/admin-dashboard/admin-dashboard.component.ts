import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjetService } from '../../services/projet.service';
import { Projet } from '../../models/projet.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  projets: Projet[] = [];
  loading = true;
  errorMessage = '';

  totalProjects = 0;
  expiredProjects = 0;
  favoriteProjects = 0;
  totalBudget = 0;

  constructor(private projetService: ProjetService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projetService.getAllProjets().subscribe({
      next: (data) => {
        const favoriteIds = this.getFavoriteIds();

        this.projets = data.map(projet => ({
          ...projet,
          isFavorite: projet.id ? favoriteIds.includes(projet.id) : false,
          estimatedBudget: this.calculateBudget(projet)
        }));

        this.calculateStats();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les projets.';
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalProjects = this.projets.length;
    this.favoriteProjects = this.projets.filter(p => p.isFavorite).length;
    this.expiredProjects = this.projets.filter(p => this.isExpired(p.date)).length;
    this.totalBudget = this.projets.reduce((sum, projet) => sum + (projet.estimatedBudget || 0), 0);
  }

  deleteProjet(id?: number): void {
    if (!id) return;

    const confirmed = confirm('Voulez-vous vraiment supprimer ce projet ?');
    if (!confirmed) return;

    this.projetService.deleteProjet(id).subscribe({
      next: () => {
        this.projets = this.projets.filter(p => p.id !== id);
        this.removeFromFavorites(id);
        this.calculateStats();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
      }
    });
  }

  isExpired(date: string): boolean {
    if (!date) return false;

    const today = new Date();
    const projectDate = new Date(date);

    today.setHours(0, 0, 0, 0);
    projectDate.setHours(0, 0, 0, 0);

    return projectDate < today;
  }

  calculateBudget(projet: Projet): number {
    const baseRates: { [key: string]: number } = {
      WEB: 800,
      MOBILE: 1200,
      DESKTOP: 900,
      DATA_SCIENCE: 1500,
      IA: 2000,
      DEVOPS: 1400,
      CYBERSECURITY: 1700,
      CLOUD_COMPUTING: 1600,
      GAME_DEV: 1800,
      IOT: 1500,
      BIG_DATA: 1900,
      BLOCKCHAIN: 2200
    };

    let budget = baseRates[projet.domaine] || 1000;

    const descriptionLength = projet.description ? projet.description.length : 0;

    if (descriptionLength > 300) {
      budget += 700;
    } else if (descriptionLength > 150) {
      budget += 400;
    } else if (descriptionLength > 80) {
      budget += 200;
    }

    if (projet.date) {
      const today = new Date();
      const projectDate = new Date(projet.date);

      today.setHours(0, 0, 0, 0);
      projectDate.setHours(0, 0, 0, 0);

      const diffTime = projectDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7 && diffDays >= 0) {
        budget += 500;
      } else if (diffDays <= 15 && diffDays > 7) {
        budget += 250;
      }
    }

    return budget;
  }

  getFavoriteIds(): number[] {
    const stored = localStorage.getItem('favoriteProjetIds');
    return stored ? JSON.parse(stored) : [];
  }

  removeFromFavorites(id: number): void {
    const updatedFavorites = this.getFavoriteIds().filter(favId => favId !== id);
    localStorage.setItem('favoriteProjetIds', JSON.stringify(updatedFavorites));
  }
}
