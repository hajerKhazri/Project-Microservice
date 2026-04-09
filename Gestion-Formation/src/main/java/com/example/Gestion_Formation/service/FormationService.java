package com.example.Gestion_Formation.service;

import com.example.Gestion_Formation.Entities.Formation;
import com.example.Gestion_Formation.dto.FormationWithReviewsDTO;
import com.example.Gestion_Formation.dto.StatistiquesDTO;

import java.util.List;

public interface FormationService {

    Formation create(Formation formation);

    Formation update(Long id, Formation formation);

    Formation getById(Long id);

    List<Formation> getAll();

    void delete(Long id);

    StatistiquesDTO getStatistiques();

    FormationWithReviewsDTO getByIdWithReviews(Long id);
}
