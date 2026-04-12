package com.example.Gestion_Formation.feign;

import com.example.Gestion_Formation.dto.ReviewDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(
        name = "evaluation-service",
        fallback = EvaluationFeignFallback.class
)
public interface EvaluationFeignClient {

    @GetMapping("/reviews/formation/{formationId}")
    List<ReviewDTO> getReviewsByFormationId(@PathVariable("formationId") Long formationId);
}
