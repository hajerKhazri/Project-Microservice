package com.example.Gestion_Formation.feign;

import com.example.Gestion_Formation.dto.ReviewDTO;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class EvaluationFeignFallback implements EvaluationFeignClient {

    @Override
    public List<ReviewDTO> getReviewsByFormationId(Long formationId) {
        // En cas d'erreur, retourner une liste vide au lieu de faire crasher l'appel
        return Collections.emptyList();
    }
}
