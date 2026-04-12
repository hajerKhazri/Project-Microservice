package tn.esprit.messagerie.rabbitmq;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class MessageConsumer {

    @RabbitListener(queues = RabbitMQConfig.QUEUE_MESSAGERIE)
    public void receiveMessageNotification(String notification) {
        log.info("Received notification from RabbitMQ: {}", notification);
        // Process the notification (e.g., push notification to frontend, log analytics,
        // etc.)
    }
}
