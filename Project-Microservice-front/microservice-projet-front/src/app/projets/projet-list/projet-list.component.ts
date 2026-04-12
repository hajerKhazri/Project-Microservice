import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProjetService } from '../../services/projet.service';
import { Projet } from '../../models/projet.model';

@Component({
  selector: 'app-projet-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './projet-list.component.html',
  styleUrls: ['./projet-list.component.css']
})
export class ProjetListComponent implements OnInit {
  projets: Projet[] = [];
  filteredProjets: Projet[] = [];
  errorMessage = '';
  loading = true;

  searchTerm = '';
  selectedDomaine = '';
  selectedSort = '';
  favoritesOnly = false;

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

  constructor(private projetService: ProjetService) {}

  ngOnInit(): void {
    this.loadProjets();
  }

  loadProjets(): void {
    this.projetService.getAllProjets().subscribe({
      next: (data) => {
        const favoriteIds = this.getFavoriteIds();

        this.projets = data.map(projet => ({
          ...projet,
          isFavorite: projet.id ? favoriteIds.includes(projet.id) : false,
          estimatedBudget: this.calculateBudget(projet)
        }));

        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les projets.';
        this.loading = false;
      }
    });
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

  deleteProjet(id?: number): void {
    if (!id) return;

    const confirmed = confirm('Voulez-vous vraiment supprimer ce projet ?');
    if (!confirmed) return;

    this.projetService.deleteProjet(id).subscribe({
      next: () => {
        this.projets = this.projets.filter(p => p.id !== id);
        this.removeFromFavorites(id);
        this.applyFilters();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
      }
    });
  }

  toggleFavorite(projet: Projet): void {
    if (!projet.id) return;

    projet.isFavorite = !projet.isFavorite;

    let favoriteIds = this.getFavoriteIds();

    if (projet.isFavorite) {
      if (!favoriteIds.includes(projet.id)) {
        favoriteIds.push(projet.id);
      }
    } else {
      favoriteIds = favoriteIds.filter(id => id !== projet.id);
    }

    localStorage.setItem('favoriteProjetIds', JSON.stringify(favoriteIds));
    this.applyFilters();
  }

  getFavoriteIds(): number[] {
    const stored = localStorage.getItem('favoriteProjetIds');
    return stored ? JSON.parse(stored) : [];
  }

  removeFromFavorites(id: number): void {
    const updatedFavorites = this.getFavoriteIds().filter(favId => favId !== id);
    localStorage.setItem('favoriteProjetIds', JSON.stringify(updatedFavorites));
  }

  get favoriteCount(): number {
    return this.projets.filter(p => p.isFavorite).length;
  }

  applyFilters(): void {
    let result = [...this.projets];

    if (this.searchTerm.trim()) {
      result = result.filter(projet =>
        projet.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedDomaine) {
      result = result.filter(projet => projet.domaine === this.selectedDomaine);
    }

    if (this.favoritesOnly) {
      result = result.filter(projet => projet.isFavorite);
    }

    if (this.selectedSort === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (this.selectedSort === 'title-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    if (this.selectedSort === 'date-asc') {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    if (this.selectedSort === 'date-desc') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    if (this.selectedSort === 'budget-asc') {
      result.sort((a, b) => (a.estimatedBudget || 0) - (b.estimatedBudget || 0));
    }

    if (this.selectedSort === 'budget-desc') {
      result.sort((a, b) => (b.estimatedBudget || 0) - (a.estimatedBudget || 0));
    }

    this.filteredProjets = result;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedDomaine = '';
    this.selectedSort = '';
    this.favoritesOnly = false;
    this.applyFilters();
  }
}
