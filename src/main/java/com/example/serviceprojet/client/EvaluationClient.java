package com.example.serviceprojet.client;

import com.example.serviceprojet.dto.ReviewDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "evaluation-service")
public interface EvaluationClient {
    @GetMapping("/api/reviews/projet/{projetId}")
    List<ReviewDTO> getReviewsByProjet(@PathVariable("projetId") Long projetId);
}