package esprit.microservice.Config;



import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE = "evaluationToSkillsQueue";

    @Bean
    public Queue queue() {
        return new Queue(QUEUE, true);
    }
    public static final String EVALUATION_TO_SKILLS_QUEUE = "evaluationToSkillsQueue";

    @Bean
    public Queue evaluationToSkillsQueue() {
        return new Queue(EVALUATION_TO_SKILLS_QUEUE, true);
    }
}
