package com.example.Gestion_Formation.messaging;

import com.example.Gestion_Formation.config.RabbitMQConfig;
import com.example.Gestion_Formation.dto.FormationEventDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class FormationEventProducer {

    private static final Logger log = LoggerFactory.getLogger(FormationEventProducer.class);
    private final RabbitTemplate rabbitTemplate;

    public FormationEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendFormationCreatedEvent(FormationEventDTO event) {
        log.info("Envoi du message RabbitMQ : formation créée [id={}]", event.getFormationId());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ROUTING_KEY,
                event
        );
    }
}
