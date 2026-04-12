package com.example.condidature.messaging;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class CondidatureMessageSender {

    @Autowired(required = false)
    private RabbitTemplate rabbitTemplate;

    public void sendProjectReachedCapacityEvent(Long projectId) {
        System.out.println("Sending message: project " + projectId + " reached max capacity.");
        if (rabbitTemplate != null) {
            rabbitTemplate.convertAndSend("project.exchange", "project.reached-capacity", projectId);
        } else {
            System.err.println("RabbitTemplate not found. Messaging disabled.");
        }
    }
}
