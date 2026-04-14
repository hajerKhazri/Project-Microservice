package esprit.microservice.Messaging;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.messaging.rabbitmq.enabled", havingValue = "true")
public class ProjectMessageConsumer {

    @RabbitListener(queues = "projectQueue")
    public void receiveMessage(String message) {
        System.out.println("Message reçu depuis RabbitMQ dans skills-service : " + message);
    }
}
