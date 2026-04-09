package Evaluation_service.messaging;

import Evaluation_service.Entity.Review;
import Evaluation_service.Repository.ReviewRepository;
import Evaluation_service.config.RabbitMQConfig;
import Evaluation_service.dto.FormationEventDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class FormationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(FormationEventConsumer.class);
    private final ReviewRepository reviewRepository;

    public FormationEventConsumer(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void handleFormationCreated(FormationEventDTO event) {
        log.info("Message reçu : formation créée [id={}, titre={}]",
                event.getFormationId(), event.getTitre());

        try {
            Review review = new Review();
            review.setFormationId(event.getFormationId());
            review.setScore(0);
            review.setComment("Évaluation automatique pour la formation : " + event.getTitre());
            review.setClientName("Système");
            review.setFreelancerId(0L);
            review.setFreelancerName("N/A");

            reviewRepository.save(review);
            log.info("Évaluation créée automatiquement pour la formation [id={}]", event.getFormationId());
        } catch (Exception e) {
            log.error("Erreur lors de la création de l'évaluation pour la formation [id={}]: {}",
                    event.getFormationId(), e.getMessage());
            throw e; // Re-throw pour que RabbitMQ puisse gérer le retry
        }
    }
}
