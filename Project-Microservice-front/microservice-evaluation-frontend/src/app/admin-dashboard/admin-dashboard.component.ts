import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvisService } from '../avis/avis.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalReviews: 0,
    distinctFreelancers: 0,
    globalAverageScore: 0,
    distinctProjects: 0
  };
  topFreelancers: any[] = [];
  positivePercent = 0;
  neutralPercent = 0;
  negativePercent = 0;

  constructor(private avisService: AvisService) {}

  ngOnInit() {
    this.loadStats();
    this.loadTopFreelancers();
    this.loadScoreDistribution();
  }

  loadStats() {
    this.avisService.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        console.error('Erreur stats:', err);
      }
    });
  }

  loadTopFreelancers() {
    this.avisService.getTopFreelancers(5).subscribe({
      next: (data) => {
        this.topFreelancers = data;
      },
      error: (err) => {
        console.error('Erreur top freelancers:', err);
      }
    });
  }

  loadScoreDistribution() {
    this.avisService.getScoreDistribution().subscribe({
      next: (data: any) => {
        // Calculer le total à partir de l'objet reçu
        let total = 0;
        let positive = 0;
        let neutral = 0;
        let negative = 0;
        
        // Parcourir l'objet pour calculer les totaux
        for (const key in data) {
          const count = data[key];
          const score = Number(key);
          total += count;
          
          if (score >= 4) {
            positive += count;
          } else if (score === 3) {
            neutral += count;
          } else if (score <= 2) {
            negative += count;
          }
        }
        
        this.positivePercent = total ? Math.round((positive / total) * 100) : 0;
        this.neutralPercent = total ? Math.round((neutral / total) * 100) : 0;
        this.negativePercent = total ? Math.round((negative / total) * 100) : 0;
      },
      error: (err) => {
        console.error('Erreur distribution:', err);
      }
    });
  }

  getStars(score: number): string {
    const full = Math.floor(score);
    return '⭐'.repeat(full) + '☆'.repeat(5 - full);
  }
}