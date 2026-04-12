package Evaluation_service.Config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // 🔹 ancienne queue (NE PAS SUPPRIMER)
    public static final String REVIEW_QUEUE = "reviewQueue";

    // 🔹 nouvelle queue (Evaluation → Skills)
    public static final String EVALUATION_TO_SKILLS_QUEUE = "evaluationToSkillsQueue";


    @Bean
    public Queue reviewQueue() {
        return new Queue(REVIEW_QUEUE, true);
    }

    // ✅ nouvelle queue pour Skills
    @Bean
    public Queue evaluationToSkillsQueue() {
        return new Queue(EVALUATION_TO_SKILLS_QUEUE, true);
    }
}