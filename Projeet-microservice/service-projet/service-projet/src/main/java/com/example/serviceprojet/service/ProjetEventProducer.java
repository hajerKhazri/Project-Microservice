package com.example.serviceprojet.service;
import com.example.serviceprojet.config.RabbitMQConfig;
import com.example.serviceprojet.dto.ProjetMessageDTO;
import com.example.serviceprojet.entite.Projet;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class ProjetEventProducer {
    private final RabbitTemplate rabbitTemplate;

    public ProjetEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendProjetCreatedEvent(Projet projet) {
        ProjetMessageDTO dto = new ProjetMessageDTO(
                projet.getId(),
                projet.getTitle(),
                projet.getDescription(),
                projet.getDate(),
                projet.getDomaine().name() // si Domaine est une enum
        );
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.ROUTING_KEY, dto);
        System.out.println("Événement de création envoyé pour le projet : " + projet.getTitle());
    }
}
