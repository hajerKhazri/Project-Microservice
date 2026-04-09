package Evaluation_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "formation.exchange";
    public static final String QUEUE = "formation.queue";
    public static final String ROUTING_KEY = "formation.created";

    @Bean
    public TopicExchange formationExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue formationQueue() {
        return QueueBuilder.durable(QUEUE).build();
    }

    @Bean
    public Binding formationBinding(Queue formationQueue, TopicExchange formationExchange) {
        return BindingBuilder.bind(formationQueue).to(formationExchange).with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter());
        // Retry simple : 3 tentatives max
        factory.setDefaultRequeueRejected(false);
        return factory;
    }
}
