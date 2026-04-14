package com.example.condidature.messaging;

import com.example.condidature.service.CondidatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProjectMessageListener {

    private final CondidatureService condidatureService;

    
    @RabbitListener(bindings = @QueueBinding(value = @Queue(value = "project.closed.queue", durable = "true"), exchange = @Exchange(value = "project.exchange", type = "topic"), key = "project.closed"))
    public void handleProjectClosed(Long projectId) {
        System.out
                .println("Received message that project " + projectId + " has closed. Rejecting related candidatures.");
        condidatureService.rejectByProjectId(projectId);
    }
}
