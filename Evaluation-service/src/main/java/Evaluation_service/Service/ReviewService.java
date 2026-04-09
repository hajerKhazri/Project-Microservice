package Evaluation_service.Service;


import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import Evaluation_service.Entity.Review;
import Evaluation_service.Repository.ReviewRepository;

import org.springframework.data.domain.Pageable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    // CREATE
    public Review addReview(Review review) {
        return reviewRepository.save(review);
    }

    // READ
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public Review getReviewById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review non trouvée"));
    }

    public List<Review> getReviewsByClientName(String clientName) {
        return reviewRepository.findByClientName(clientName);
    }

    public List<Review> getReviewsByFreelancerId(Long freelancerId) {
        return reviewRepository.findByFreelancerId(freelancerId);
    }

    public List<Review> getReviewsByFormationId(Long formationId) {
        return reviewRepository.findByFormationId(formationId);
    }

    // UPDATE
    public Review updateReview(Long id, Review reviewDetails) {
        Review review = getReviewById(id);
        review.setScore(reviewDetails.getScore());
        review.setComment(reviewDetails.getComment());
        review.setClientName(reviewDetails.getClientName());
        review.setFreelancerId(reviewDetails.getFreelancerId());
        review.setFreelancerName(reviewDetails.getFreelancerName());
        return reviewRepository.save(review);
    }

    // DELETE
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }
    // Moyenne pour un freelancer spécifique
    public Double getAverageNoteForFreelancer(Long freelancerId) {
        Double avg = reviewRepository.getAverageNoteByFreelancerId(freelancerId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }
    // Moyenne pour tous les freelancers (sous forme de Map)
    public Map<Long, Double> getAverageNoteForAllFreelancers() {
        List<Object[]> results = reviewRepository.getAverageNoteForAllFreelancers();
        Map<Long, Double> averages = new HashMap<>();
        for (Object[] row : results) {
            Long freelancerId = ((Number) row[0]).longValue();
            Double avg = ((Number) row[1]).doubleValue();
            averages.put(freelancerId, Math.round(avg * 10.0) / 10.0);
        }
        return averages;
    }

    public List<Object[]> findTopFreelancers(int limit) {
        Pageable pageable = (Pageable) (Pageable) PageRequest.of(0, limit);
        return reviewRepository.findTopFreelancersByAverageScore(pageable);
    }
}