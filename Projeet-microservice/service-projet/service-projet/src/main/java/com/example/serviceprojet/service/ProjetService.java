package com.example.serviceprojet.service;

import com.example.serviceprojet.Repositorie.ProjetRepository;
import com.example.serviceprojet.client.EvaluationClient;
import com.example.serviceprojet.dto.ReviewDTO;
import com.example.serviceprojet.entite.Projet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjetService implements IProjetService {

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private EvaluationClient evaluationClient;

    public Projet getProjetWithReviews(Long id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec l'id: " + id));
        List<ReviewDTO> reviews = evaluationClient.getReviewsByProjet(id);
        projet.setReviews(reviews);
        return projet;
    }
    @Autowired
    private ProjetEventProducer eventProducer;


    @Override
    public Projet ajouterProjet(Projet projet) {
        Projet saved = projetRepository.save(projet);
        try {
            eventProducer.sendProjetCreatedEvent(saved);
        } catch (Exception e) {
            e.printStackTrace(); // Affiche l'exception dans la console
            throw new RuntimeException("Erreur lors de l'envoi du message RabbitMQ: " + e.getMessage(), e);
        }
        return saved;
    }

    @Override
    public List<Projet> listerTousProjets() {
        return projetRepository.findAll();
    }

    @Override
    public Optional<Projet> voirProjet(Long id) {
        return projetRepository.findById(id);
    }

    @Override
    public Projet modifierProjet(Long id, Projet projetDetails) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec l'id: " + id));

        projet.setTitle(projetDetails.getTitle());
        projet.setDescription(projetDetails.getDescription());
        projet.setDate(projetDetails.getDate());
        projet.setDomaine(projetDetails.getDomaine());

        return projetRepository.save(projet);
    }

    @Override
    public void supprimerProjet(Long id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé avec l'id: " + id));
        projetRepository.delete(projet);
    }
}
