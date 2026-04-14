package Evaluation_service.Service;

public record RabbitTraceEvent(
        String direction,
        String queue,
        String service,
        String message,
        String timestamp
) {
}
