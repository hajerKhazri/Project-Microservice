package Evaluation_service.Service;

import Evaluation_service.Config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class RabbitProducer {

    private final RabbitTemplate rabbitTemplate;

    public RabbitProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    // 🔹 ancien code (NE PAS MODIFIER)
    public void sendMessage(String message) {
        rabbitTemplate.convertAndSend("reviewQueue", message);
        System.out.println("Message envoyé : " + message);
    }

    // 🔥 NOUVELLE MÉTHODE → vers Skills
    public void sendToSkills(String message) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EVALUATION_TO_SKILLS_QUEUE,
                message
        );
        System.out.println("Message envoyé vers Skills : " + message);
    }
}