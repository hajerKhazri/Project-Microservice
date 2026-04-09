package esprit.microservice.Config;

import org.springframework.amqp.core.Queue;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "app.messaging.rabbitmq.enabled", havingValue = "true")
public class RabbitMQConfig {

    public static final String QUEUE_NAME = "projectQueue";

    @Bean
    public Queue queue() {
        return new Queue(QUEUE_NAME, true);
    }
}
