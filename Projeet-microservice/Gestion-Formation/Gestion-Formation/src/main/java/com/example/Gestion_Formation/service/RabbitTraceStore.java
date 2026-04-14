package com.example.Gestion_Formation.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

@Service
public class RabbitTraceStore {

    private static final int MAX_EVENTS = 12;
    private final Deque<RabbitTraceEvent> events = new ArrayDeque<>();

    public synchronized void record(String direction, String queue, String service, String message) {
        if (events.size() >= MAX_EVENTS) {
            events.removeFirst();
        }

        events.addLast(new RabbitTraceEvent(
                direction,
                queue,
                service,
                message,
                Instant.now().toString()
        ));
    }

    public synchronized List<RabbitTraceEvent> snapshot() {
        return new ArrayList<>(events);
    }
}
