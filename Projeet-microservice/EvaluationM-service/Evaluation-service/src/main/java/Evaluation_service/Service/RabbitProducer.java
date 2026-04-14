package Evaluation_service.Service;

import Evaluation_service.Config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class RabbitProducer {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitTraceStore rabbitTraceStore;

    public RabbitProducer(RabbitTemplate rabbitTemplate, RabbitTraceStore rabbitTraceStore) {
        this.rabbitTemplate = rabbitTemplate;
        this.rabbitTraceStore = rabbitTraceStore;
    }

    // 🔹 ancien code (NE PAS MODIFIER)
    public void sendMessage(String message) {
        rabbitTemplate.convertAndSend("reviewQueue", message);
        rabbitTraceStore.record("sent", "reviewQueue", "evaluation-service", message);
        System.out.println("Message envoyé : " + message);
    }

    // 🔥 NOUVELLE MÉTHODE → vers Skills
    public void sendToSkills(String message) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EVALUATION_TO_SKILLS_QUEUE,
                message
        );
        rabbitTraceStore.record("sent", RabbitMQConfig.EVALUATION_TO_SKILLS_QUEUE, "evaluation-service", message);
        System.out.println("Message envoyé vers Skills : " + message);
    }
}
