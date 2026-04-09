import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface JobOffer {
  title: string;
  type: 'Remote' | 'Hybrid' | 'On-site';
  budget: string;
  tags: string[];
  description: string;
}

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent {
  searchTerm = '';

  readonly jobs: JobOffer[] = [
    {
      title: 'Front-end Developer (Angular)',
      type: 'Remote',
      budget: '$20-$50 / hour',
      tags: ['HTML', 'CSS', 'Angular'],
      description: 'Build modern screens for FreeLink and connect them to the microservice APIs.'
    },
    {
      title: 'UI/UX Designer',
      type: 'Hybrid',
      budget: '$15-$40 / hour',
      tags: ['Figma', 'UX', 'UI'],
      description: 'Design clean interfaces and improve user journeys from wireframes to final pages.'
    },
    {
      title: 'Back-end Developer (Spring Boot)',
      type: 'Remote',
      budget: '$25-$60 / hour',
      tags: ['Spring', 'REST API', 'MySQL'],
      description: 'Build secure REST APIs and integrate them through Eureka and the API gateway.'
    }
  ];

  get filteredJobs(): JobOffer[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.jobs;
    }

    return this.jobs.filter((job) =>
      [job.title, job.type, job.budget, job.description, job.tags.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }
}
