package com.example.Gestion_Formation.service;

public record RabbitTraceEvent(
        String direction,
        String queue,
        String service,
        String message,
        String timestamp
) {
}
