package com.example.Gestion_Formation.dto;

import com.example.Gestion_Formation.Entities.Formation;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormationWithReviewsDTO {
    private Formation formation;
    private List<ReviewDTO> reviews;
}
