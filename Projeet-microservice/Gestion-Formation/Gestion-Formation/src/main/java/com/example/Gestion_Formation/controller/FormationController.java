package com.example.Gestion_Formation.controller;

import com.example.Gestion_Formation.Entities.Formation;
import com.example.Gestion_Formation.dto.FormationWithReviewsDTO;
import com.example.Gestion_Formation.dto.StatistiquesDTO;
import com.example.Gestion_Formation.service.FormationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formations")
public class FormationController {

    private final FormationService formationService;

    public FormationController(FormationService formationService) {
        this.formationService = formationService;
    }

    @PostMapping
    public ResponseEntity<Formation> create(@Valid @RequestBody Formation formation) {
        return ResponseEntity.status(HttpStatus.CREATED).body(formationService.create(formation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Formation> update(@PathVariable Long id, @Valid @RequestBody Formation formation) {
        return ResponseEntity.ok(formationService.update(id, formation));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Formation> getById(@PathVariable Long id) {
        return ResponseEntity.ok(formationService.getById(id));
    }

    // Feign : Formation + ses évaluations depuis Evaluation-Service
    @GetMapping("/{id}/with-reviews")
    public ResponseEntity<FormationWithReviewsDTO> getByIdWithReviews(@PathVariable Long id) {
        return ResponseEntity.ok(formationService.getByIdWithReviews(id));
    }

    @GetMapping
    public ResponseEntity<List<Formation>> getAll() {
        return ResponseEntity.ok(formationService.getAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        formationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statistiques")
    public ResponseEntity<StatistiquesDTO> getStatistiques() {
        return ResponseEntity.ok(formationService.getStatistiques());
    }
}
