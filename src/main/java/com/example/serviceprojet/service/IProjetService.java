package com.example.serviceprojet.service;

import com.example.serviceprojet.entite.Projet;

import java.util.List;
import java.util.Optional;

public interface IProjetService {
    Projet ajouterProjet(Projet projet);
    List<Projet> listerTousProjets();
    Optional<Projet> voirProjet(Long id);
    Projet modifierProjet(Long id, Projet projet);
    void supprimerProjet(Long id);
    Projet getProjetWithReviews(Long id);
}
