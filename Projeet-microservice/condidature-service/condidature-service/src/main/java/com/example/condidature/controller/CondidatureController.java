package com.example.condidature.controller;

import com.example.condidature.entity.Condidature;
import com.example.condidature.service.CondidatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/condidatures")
@RequiredArgsConstructor
public class CondidatureController {

    private final CondidatureService service;

    @GetMapping
    public List<Condidature> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Condidature getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public Condidature create(@RequestBody Condidature condidature) {
        return service.create(condidature);
    }

    @PutMapping("/{id}")
    public Condidature update(@PathVariable Long id, @RequestBody Condidature condidature) {
        return service.update(id, condidature);
    }

    @PutMapping("/{id}/status")
    public Condidature updateStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/project/{projectId}/accepted-count")
    public long getAcceptedCount(@PathVariable Long projectId) {
        return service.getAcceptedCount(projectId);
    }
}
