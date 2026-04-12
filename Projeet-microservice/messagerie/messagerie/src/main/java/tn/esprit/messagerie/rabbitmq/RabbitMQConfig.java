package tn.esprit.messagerie.rabbitmq;

import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.amqp.core.Queue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_MESSAGERIE = "messagerie.queue";
    public static final String EXCHANGE = "messagerie.exchange";
    public static final String ROUTING_KEY = "messagerie.routingKey";

    @Bean
    public Queue queue() {
        return new Queue(QUEUE_MESSAGERIE, true);
    }
}
