package com.example.Gestion_Formation.dto;

import lombok.*;

import java.util.Map;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StatistiquesDTO {

    private long totalFormations;
    private double tauxMoyenAvancement;
    private Map<String, Long> formationsParStatut;
    private long formationsEnCours;
    private long formationsTerminees;
    private long formationsPlanifiees;
    private double dureeMoyenneJours;
    private double progressionGlobale;
}
