package esprit.microservice.Services;

public record RabbitTraceEvent(
        String direction,
        String queue,
        String service,
        String message,
        String timestamp
) {
}
