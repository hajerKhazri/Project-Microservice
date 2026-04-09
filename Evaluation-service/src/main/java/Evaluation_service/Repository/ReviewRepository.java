package Evaluation_service.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import Evaluation_service.Entity.Review;

import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByClientName(String clientName);
    List<Review> findByFreelancerId(Long freelancerId);
    List<Review> findByFormationId(Long formationId);

    // ✅ Correction : utiliser 'score' au lieu de 'note'
    @Query("SELECT AVG(r.score) FROM Review r WHERE r.freelancerId = :freelancerId")
    Double getAverageNoteByFreelancerId(@Param("freelancerId") Long freelancerId);

    // ✅ Correction : utiliser 'score'
    @Query("SELECT r.freelancerId, AVG(r.score) FROM Review r GROUP BY r.freelancerId")
    List<Object[]> getAverageNoteForAllFreelancers();
    @Query("SELECT COUNT(DISTINCT r.freelancerId) FROM Review r")
    long countDistinctFreelancers();

    @Query("SELECT AVG(r.score) FROM Review r")
    Double getGlobalAverageScore();

    @Query("SELECT COUNT(r) FROM Review r")
    long countDistinctProjects();

    @Query("SELECT r.freelancerId, r.freelancerName, AVG(r.score), COUNT(r) FROM Review r GROUP BY r.freelancerId, r.freelancerName ORDER BY AVG(r.score) DESC")
    List<Object[]> findTopFreelancersByAverageScore(Pageable pageable);
// pour l'utiliser avec limit : PageRequest.of(0, limit)

    @Query("SELECT r.score, COUNT(r) FROM Review r GROUP BY r.score ORDER BY r.score")
    List<Object[]> getScoreDistribution();
}