package Evaluation_service.Controller;

import Evaluation_service.Repository.ReviewRepository;
import Evaluation_service.Service.RabbitTraceEvent;
import Evaluation_service.Service.RabbitTraceStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import Evaluation_service.Entity.Review;
import Evaluation_service.Service.ReviewService;
import org.springframework.data.domain.PageRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewRepository reviewRepository;
    private final RabbitTraceStore rabbitTraceStore;

    public ReviewController(ReviewService reviewService, ReviewRepository reviewRepository, RabbitTraceStore rabbitTraceStore) {
        this.reviewService = reviewService;
        this.reviewRepository = reviewRepository;
        this.rabbitTraceStore = rabbitTraceStore;
    }

    // CREATE
    @PostMapping("/add")
    public Review addReview(@RequestBody Review review) {
        return reviewService.addReview(review);
    }

    // READ
    @GetMapping("/all")
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @GetMapping("/{id}")
    public Review getReviewById(@PathVariable Long id) {
        return reviewService.getReviewById(id);
    }

    @GetMapping("/client/{clientName}")
    public List<Review> getReviewsByClientName(@PathVariable String clientName) {
        return reviewService.getReviewsByClientName(clientName);
    }

    @GetMapping("/freelancer/{freelancerId}")
    public List<Review> getReviewsByFreelancerId(@PathVariable Long freelancerId) {
        return reviewService.getReviewsByFreelancerId(freelancerId);
    }

    // UPDATE
    @PutMapping("/update/{id}")
    public Review updateReview(@PathVariable Long id, @RequestBody Review review) {
        return reviewService.updateReview(id, review);
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    public void deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
    }

    @GetMapping("/freelancer/{freelancerId}/average")
    public ResponseEntity<Double> getAverageNote(@PathVariable Long freelancerId) {
        Double average = reviewService.getAverageNoteForFreelancer(freelancerId);
        return ResponseEntity.ok(average);
    }

    // Endpoint pour obtenir les moyennes de tous les freelancers
    @GetMapping("/averages")
    public ResponseEntity<Map<Long, Double>> getAllAverages() {
        return ResponseEntity.ok(reviewService.getAverageNoteForAllFreelancers());
    }

    // ADMIN STATS
    @GetMapping("/admin/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        // ✅ Correction ici
        stats.put("totalReviews", reviewRepository.count());
        stats.put("distinctFreelancers", reviewRepository.countDistinctFreelancers());
        stats.put("globalAverageScore", reviewRepository.getGlobalAverageScore());
        stats.put("totalReviews", reviewRepository.count());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/admin/top-freelancers")
    public ResponseEntity<List<Map<String, Object>>> getTopFreelancers(
            @RequestParam(defaultValue = "5") int limit) {

        List<Object[]> results = reviewRepository.findTopFreelancersByAverageScore(
                PageRequest.of(0, limit)
        );
        List<Map<String, Object>> top = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> item = new HashMap<>();
            item.put("freelancerId", row[0]);
            item.put("freelancerName", row[1]);
            item.put("averageScore", Math.round((Double) row[2] * 10.0) / 10.0);
            item.put("reviewCount", row[3]);
            top.add(item);
        }

        return ResponseEntity.ok(top);
    }

    @GetMapping("/admin/score-distribution")
    public ResponseEntity<Map<Integer, Long>> getScoreDistribution() {
        List<Object[]> results = reviewRepository.getScoreDistribution();
        Map<Integer, Long> distribution = new HashMap<>();
        for (Object[] row : results) {
            distribution.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }
        return ResponseEntity.ok(distribution);  // Spring convertit automatiquement en JSON
    }

    @GetMapping("/debug/rabbit-events")
    public ResponseEntity<List<RabbitTraceEvent>> getRabbitEvents() {
        return ResponseEntity.ok(rabbitTraceStore.snapshot());
    }
    //endpoint de OpenFeign
    @GetMapping("/test/{id}")
    public ResponseEntity<?> test(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getFormation(id));
    }
}
