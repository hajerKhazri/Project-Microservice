import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjetService } from '../../services/projet.service';
import { Projet } from '../../models/projet.model';

@Component({
  selector: 'app-projet-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './projet-detail.component.html',
  styleUrls: ['./projet-detail.component.css']
})
export class ProjetDetailComponent implements OnInit {
  projet?: Projet;
  errorMessage = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private projetService: ProjetService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.projetService.getProjetById(id).subscribe({
        next: (data) => {
          this.projet = {
            ...data,
            estimatedBudget: this.calculateBudget(data)
          };
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Projet introuvable.';
          this.loading = false;
        }
      });
    }
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
}
