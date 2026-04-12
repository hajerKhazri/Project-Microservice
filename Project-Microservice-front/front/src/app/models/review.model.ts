export interface Review {
  id?: number;
  score: number;
  comment: string;
  clientName: string;
  freelancerId: number;
  freelancerName?: string;
  date?: string;
}

export interface ReviewStats {
  totalReviews: number;
  distinctFreelancers: number;
  globalAverageScore: number;
}

export interface TopFreelancer {
  freelancerId: number;
  freelancerName: string;
  averageScore: number;
  reviewCount: number;
}
