package esprit.microservice.Services;





import esprit.microservice.Config.RabbitMQConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class EvaluationMessageConsumer {

    @RabbitListener(queues = RabbitMQConfig.EVALUATION_TO_SKILLS_QUEUE)
    public void receiveMessage(String message) {
        System.out.println("Message reçu dans Skills depuis Evaluation : " + message);
    }
}