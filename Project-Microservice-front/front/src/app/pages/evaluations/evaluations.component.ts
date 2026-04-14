import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { finalize } from 'rxjs';
import { SessionService } from '../../core/services/session.service';
import { AppUser } from '../../models/user.model';
import { Review, ReviewStats, TopFreelancer } from '../../models/review.model';
import { ReviewsService } from '../../services/reviews.service';
import { UsersService } from '../../services/users.service';

interface ReviewFormValue {
  id?: number;
  clientName: string;
  freelancerId: number | null;
  freelancerName: string;
  score: number;
  comment: string;
}

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './evaluations.component.html',
  styleUrl: './evaluations.component.css'
})
export class EvaluationsComponent implements OnInit {
  reviews: Review[] = [];
  freelancers: AppUser[] = [];
  stats: ReviewStats | null = null;
  topFreelancers: TopFreelancer[] = [];
  distribution: Record<number, number> = {};

  searchTerm = '';
  selectedScore = '';

  loading = false;
  saving = false;
  deletingId?: number;
  errorMessage = '';
  successMessage = '';

  isFormOpen = false;
  isEditMode = false;
  formSubmitted = false;
  formReview: ReviewFormValue = this.createEmptyReview();

  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadReviews();
    this.loadStats();
    this.loadFreelancers();
  }

  get filteredReviews(): Review[] {
    let items = [...this.reviews];

    if (this.selectedScore) {
      items = items.filter((review) => review.score === Number(this.selectedScore));
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      items = items.filter((review) =>
        `${review.clientName} ${review.freelancerName ?? ''} ${review.comment}`.toLowerCase().includes(term)
      );
    }

    return items.sort((left, right) => {
      const leftDate = new Date(left.date ?? 0).getTime();
      const rightDate = new Date(right.date ?? 0).getTime();
      return rightDate - leftDate;
    });
  }

  get distributionEntries(): Array<{ score: number; count: number }> {
    return Object.entries(this.distribution)
      .map(([score, count]) => ({
        score: Number(score),
        count: Number(count)
      }))
      .sort((left, right) => right.score - left.score);
  }

  loadReviews(): void {
    this.loading = true;
    this.errorMessage = '';

    this.reviewsService.getAll()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (reviews) => {
          this.reviews = reviews ?? [];
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Unable to load evaluations. Check the gateway and evaluation service.');
        }
      });
  }

  loadStats(): void {
    this.reviewsService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: () => {
        this.stats = null;
      }
    });

    this.reviewsService.getTopFreelancers().subscribe({
      next: (items) => {
        this.topFreelancers = items ?? [];
      },
      error: () => {
        this.topFreelancers = [];
      }
    });

    this.reviewsService.getScoreDistribution().subscribe({
      next: (distribution) => {
        this.distribution = distribution ?? {};
      },
      error: () => {
        this.distribution = {};
      }
    });
  }

  loadFreelancers(): void {
    this.usersService.getAll().subscribe({
      next: (users) => {
        this.freelancers = (users ?? [])
          .filter((user) => user.role === 'FREELANCER')
          .sort((left, right) => this.displayNameFor(left).localeCompare(this.displayNameFor(right)));
      },
      error: () => {
        this.freelancers = [];
      }
    });
  }

  refreshData(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.loadReviews();
    this.loadStats();
    this.loadFreelancers();
  }

  openCreate(): void {
    const currentUser = this.sessionService.getCurrentUser();

    this.isEditMode = false;
    this.formReview = {
      ...this.createEmptyReview(),
      clientName: currentUser ? this.displayNameFor(currentUser) : ''
    };
    this.formSubmitted = false;
    this.isFormOpen = true;
    this.clearMessages();
  }

  openEdit(review: Review): void {
    this.isEditMode = true;
    this.formReview = {
      id: review.id,
      clientName: review.clientName,
      freelancerId: review.freelancerId,
      freelancerName: review.freelancerName ?? '',
      score: review.score,
      comment: review.comment
    };
    this.formSubmitted = false;
    this.isFormOpen = true;
    this.clearMessages();
  }

  closeForm(): void {
    if (!this.saving) {
      this.isFormOpen = false;
      this.formSubmitted = false;
    }
  }

  onFreelancerChange(userId: number | null): void {
    const freelancer = this.freelancers.find((item) => item.id === userId);

    if (freelancer) {
      this.formReview.freelancerName = this.displayNameFor(freelancer);
    }
  }

  saveReview(reviewForm: NgForm): void {
    this.formSubmitted = true;

    if (reviewForm.invalid || !this.isValidReview(this.formReview)) {
      reviewForm.control.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.clearMessages();

    const payload: Review = {
      clientName: this.formReview.clientName.trim(),
      freelancerId: Number(this.formReview.freelancerId),
      freelancerName: this.formReview.freelancerName.trim() || undefined,
      score: Number(this.formReview.score),
      comment: this.formReview.comment.trim()
    };

    const request = this.isEditMode && this.formReview.id
      ? this.reviewsService.update(this.formReview.id, payload)
      : this.reviewsService.create(payload);

    request
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe({
        next: () => {
          this.successMessage = this.isEditMode ? 'Evaluation updated successfully.' : 'Evaluation created successfully.';
          this.isFormOpen = false;
          this.formSubmitted = false;
          this.loadReviews();
          this.loadStats();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Unable to save the evaluation right now.');
        }
      });
  }

  deleteReview(review: Review): void {
    if (!review.id || !window.confirm(`Delete the review of ${review.clientName}?`)) {
      return;
    }

    this.deletingId = review.id;
    this.clearMessages();

    this.reviewsService.delete(review.id)
      .pipe(finalize(() => {
        this.deletingId = undefined;
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'Evaluation deleted successfully.';
          this.reviews = this.reviews.filter((item) => item.id !== review.id);
          this.loadStats();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Unable to delete the evaluation right now.');
        }
      });
  }

  scoreLabel(score: number): string {
    return `${score}/5`;
  }

  starsLabel(score: number): string {
    const safeScore = Math.max(0, Math.min(5, Math.round(score)));
    return '★'.repeat(safeScore) + '☆'.repeat(5 - safeScore);
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'No date';
    }

    return this.datePipe.transform(value, 'dd/MM/yyyy HH:mm') ?? value;
  }

  displayNameFor(user: Pick<AppUser, 'username' | 'first_name' | 'last_name'>): string {
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    return fullName || user.username;
  }

  shouldShowError(model: NgModel): boolean {
    return Boolean(model.invalid && (model.touched || this.formSubmitted));
  }

  hasError(model: NgModel, errorKey: string): boolean {
    return this.shouldShowError(model) && Boolean(model.errors?.[errorKey]);
  }

  private createEmptyReview(): ReviewFormValue {
    return {
      clientName: '',
      freelancerId: null,
      freelancerName: '',
      score: 5,
      comment: ''
    };
  }

  private isValidReview(review: ReviewFormValue): boolean {
    return Boolean(review.clientName.trim())
      && Boolean(review.comment.trim())
      && Number(review.score) >= 1
      && Number(review.score) <= 5
      && Number(review.freelancerId) > 0;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private extractErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return fallbackMessage;
  }
}
