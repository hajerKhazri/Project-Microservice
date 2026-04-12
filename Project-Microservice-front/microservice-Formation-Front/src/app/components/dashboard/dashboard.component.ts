import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { StatistiquesDTO } from '../../models/formation.model';
import { FormationService } from '../../services/formation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats?: StatistiquesDTO;
  loading = true;
  error = false;

  statutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Planifié', 'En cours', 'Terminé'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#ff9800', '#1976d2', '#4caf50'] }]
  };

  statutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Planifié', 'En cours', 'Terminé'],
    datasets: [{ data: [0, 0, 0], label: 'Formations', backgroundColor: ['#ff9800', '#1976d2', '#4caf50'] }]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  constructor(
    private formationService: FormationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = false;

    this.formationService.getStatistiques().subscribe({
      next: (data) => {
        this.stats = data;
        this.updateCharts(data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.snackBar.open('Erreur lors du chargement des statistiques', 'Fermer', {
          duration: 4000,
          panelClass: 'snack-error'
        });
      }
    });
  }

  private updateCharts(stats: StatistiquesDTO): void {
    const values = [
      stats.formationsPlanifiees,
      stats.formationsEnCours,
      stats.formationsTerminees
    ];

    this.statutChartData = {
      labels: ['Planifié', 'En cours', 'Terminé'],
      datasets: [{ data: values, backgroundColor: ['#ff9800', '#1976d2', '#4caf50'] }]
    };

    this.barChartData = {
      labels: ['Planifié', 'En cours', 'Terminé'],
      datasets: [{ data: values, label: 'Formations', backgroundColor: ['#ff9800', '#1976d2', '#4caf50'] }]
    };
  }

  getProgressColor(): 'primary' | 'accent' | 'warn' {
    if (!this.stats) return 'primary';
    if (this.stats.tauxMoyenAvancement >= 75) return 'primary';
    if (this.stats.tauxMoyenAvancement >= 40) return 'accent';
    return 'warn';
  }
}