package tn.esprit.messagerie.rabbitmq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.stereotype.Service;
import tn.esprit.messagerie.entities.Messagerie;

// @Service
@Slf4j
@RequiredArgsConstructor
public class MessageProducer {

    private final AmqpTemplate amqpTemplate;

    public void sendMessageNotification(Messagerie messagerie) {
        log.info("Sending message notification to RabbitMQ for message ID: {} from Sender ID: {}", messagerie.getId(),
                messagerie.getIdSender());
        // Custom message format or object can be sent
        String notification = String.format("User %d sent a message to User %d at %s",
                messagerie.getIdSender(), messagerie.getIdReceiver(), messagerie.getSentAt());

        amqpTemplate.convertAndSend(RabbitMQConfig.QUEUE_MESSAGERIE, notification);
    }
}
