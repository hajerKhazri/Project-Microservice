package com.example.condidature.service;

import com.example.condidature.client.ProjectFeignClient;
import com.example.condidature.dto.ProjectDTO;
import com.example.condidature.entity.Condidature;
import com.example.condidature.messaging.CondidatureMessageSender;
import com.example.condidature.repository.CondidatureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CondidatureService {

    private final CondidatureRepository repository;
    private final ProjectFeignClient projectFeignClient;
    private final CondidatureMessageSender messageSender;

    public List<Condidature> getAll() {
        return repository.findAll();
    }

    public Condidature getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Condidature not found"));
    }

    public Condidature create(Condidature condidature) {
        // Advanced Logic 1: Check if project exists and has capacity
        ProjectDTO project;
        try {
            project = projectFeignClient.getById(condidature.getProjectId());
        } catch (Exception e) {
            throw new RuntimeException(
                    "Could not verify project with ID " + condidature.getProjectId() + ". Error: " + e.getMessage());
        }

        if (project == null || "CLOSED".equals(project.getStatus())) {
            throw new RuntimeException("Project not found or already closed");
        }

        // Quota Check
        long acceptedCount = repository.countByProjectIdAndStatus(condidature.getProjectId(), "ACCEPTED");
        if (project.getMaxCapacity() != null && acceptedCount >= project.getMaxCapacity()) {
            throw new RuntimeException("Project has reached maximum capacity of " + project.getMaxCapacity());
        }

        condidature.setStatus("PENDING");
        return repository.save(condidature);
    }

    public Condidature updateStatus(Long id, String status) {
        Condidature c = getById(id);
        c.setStatus(status);
        Condidature saved = repository.save(c);

        // Advanced Logic 2: Auto-Closure of project via RabbitMQ
        if ("ACCEPTED".equals(status)) {
            ProjectDTO project = projectFeignClient.getById(saved.getProjectId());
            long acceptedCount = repository.countByProjectIdAndStatus(saved.getProjectId(), "ACCEPTED");

            if (project.getMaxCapacity() != null && acceptedCount >= project.getMaxCapacity()) {
                messageSender.sendProjectReachedCapacityEvent(saved.getProjectId());
            }
        }
        return saved;
    }

    public Condidature update(Long id, Condidature updated) {
        Condidature existing = getById(id);
        existing.setCandidateName(updated.getCandidateName());
        existing.setEmail(updated.getEmail());
        existing.setStatus(updated.getStatus());
        existing.setProjectId(updated.getProjectId());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    // Called by RabbitMQ Listener
    public void rejectByProjectId(Long projectId) {
        List<Condidature> candidatures = repository.findByProjectId(projectId);
        candidatures.forEach(c -> c.setStatus("REJECTED_PROJECT_CLOSED"));
        repository.saveAll(candidatures);
    }
}
