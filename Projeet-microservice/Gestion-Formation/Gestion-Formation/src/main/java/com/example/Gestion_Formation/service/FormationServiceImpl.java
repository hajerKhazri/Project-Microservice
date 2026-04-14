package com.example.Gestion_Formation.service;

import com.example.Gestion_Formation.Entities.Formation;
import com.example.Gestion_Formation.Entities.StatutFormation;
import com.example.Gestion_Formation.dto.FormationEventDTO;
import com.example.Gestion_Formation.dto.FormationWithReviewsDTO;
import com.example.Gestion_Formation.dto.ReviewDTO;
import com.example.Gestion_Formation.dto.StatistiquesDTO;
import com.example.Gestion_Formation.feign.EvaluationFeignClient;
import com.example.Gestion_Formation.messaging.FormationEventProducer;
import com.example.Gestion_Formation.repository.FormationRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class FormationServiceImpl implements FormationService {

    private final FormationRepository formationRepository;
    private final EvaluationFeignClient evaluationFeignClient;
    private final FormationEventProducer formationEventProducer;
    private final RabbitTraceStore rabbitTraceStore;

    public FormationServiceImpl(FormationRepository formationRepository,
                                @Qualifier("com.example.Gestion_Formation.feign.EvaluationFeignClient")
                                EvaluationFeignClient evaluationFeignClient,
                                FormationEventProducer formationEventProducer,
                                RabbitTraceStore rabbitTraceStore) {
        this.formationRepository = formationRepository;
        this.evaluationFeignClient = evaluationFeignClient;
        this.formationEventProducer = formationEventProducer;
        this.rabbitTraceStore = rabbitTraceStore;
    }

    @Override
    public Formation create(Formation formation) {
        Formation saved = formationRepository.save(formation);

        try {
            FormationEventDTO event = FormationEventDTO.builder()
                    .formationId(saved.getId())
                    .titre(saved.getTitre())
                    .description(saved.getDescription())
                    .eventType("CREATED")
                    .build();

            formationEventProducer.sendFormationCreatedEvent(event);
            System.out.println("✅ Event RabbitMQ envoyé avec succès");
        } catch (Exception e) {
            System.out.println("⚠️ RabbitMQ non disponible, event non envoyé");
        }

        return saved;
    }

    @Override
    public Formation update(Long id, Formation updated) {
        Formation existing = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation introuvable : " + id));

        existing.setTitre(updated.getTitre());
        existing.setDescription(updated.getDescription());
        existing.setDateDebut(updated.getDateDebut());
        existing.setDateFin(updated.getDateFin());
        existing.setStatut(updated.getStatut());
        existing.setAvancement(updated.getAvancement());

        Formation saved = formationRepository.save(existing);

        try {
            FormationEventDTO event = FormationEventDTO.builder()
                    .formationId(saved.getId())
                    .titre(saved.getTitre())
                    .description(saved.getDescription())
                    .eventType("UPDATED")
                    .build();

            formationEventProducer.sendFormationCreatedEvent(event);
            System.out.println("✅ Event UPDATE RabbitMQ envoyé avec succès");
        } catch (Exception e) {
            System.out.println("⚠️ RabbitMQ non disponible, event UPDATE non envoyé");
        }

        return saved;
    }

    @Override
    public Formation getById(Long id) {
        return formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation introuvable : " + id));
    }

    @Override
    public List<Formation> getAll() {
        return formationRepository.findAll();
    }

    @Override
    public void delete(Long id) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation introuvable : " + id));

        try {
            FormationEventDTO event = FormationEventDTO.builder()
                    .formationId(formation.getId())
                    .titre(formation.getTitre())
                    .description(formation.getDescription())
                    .eventType("DELETED")
                    .build();

            formationEventProducer.sendFormationCreatedEvent(event);
            System.out.println("✅ Event DELETE RabbitMQ envoyé avec succès");
        } catch (Exception e) {
            System.out.println("⚠️ RabbitMQ non disponible, event DELETE non envoyé");
        }

        formationRepository.delete(formation);
    }

    @Override
    public StatistiquesDTO getStatistiques() {
        List<Formation> formations = formationRepository.findAll();
        long total = formations.size();

        double tauxMoyen = formations.stream()
                .mapToInt(f -> f.getAvancement() != null ? f.getAvancement() : 0)
                .average()
                .orElse(0.0);

        long enCours = formationRepository.countByStatut(StatutFormation.EN_COURS);
        long terminees = formationRepository.countByStatut(StatutFormation.TERMINE);
        long planifiees = formationRepository.countByStatut(StatutFormation.PLANIFIE);

        Map<String, Long> parStatut = new LinkedHashMap<>();
        parStatut.put("PLANIFIE", planifiees);
        parStatut.put("EN_COURS", enCours);
        parStatut.put("TERMINE", terminees);

        double dureeMoyenne = formations.stream()
                .filter(f -> f.getDateDebut() != null && f.getDateFin() != null)
                .mapToLong(f -> ChronoUnit.DAYS.between(f.getDateDebut(), f.getDateFin()))
                .average()
                .orElse(0.0);

        double progressionGlobale = total > 0 ? (double) terminees / total * 100 : 0.0;

        return StatistiquesDTO.builder()
                .totalFormations(total)
                .tauxMoyenAvancement(Math.round(tauxMoyen * 100.0) / 100.0)
                .formationsParStatut(parStatut)
                .formationsEnCours(enCours)
                .formationsTerminees(terminees)
                .formationsPlanifiees(planifiees)
                .dureeMoyenneJours(Math.round(dureeMoyenne * 100.0) / 100.0)
                .progressionGlobale(Math.round(progressionGlobale * 100.0) / 100.0)
                .build();
    }

    @Override
    public FormationWithReviewsDTO getByIdWithReviews(Long id) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation introuvable : " + id));

        List<ReviewDTO> reviews;
        try {
            reviews = evaluationFeignClient.getReviewsByFormationId(id);
        } catch (Exception e) {
            reviews = List.of();
            System.out.println("⚠️ Evaluation-Service non disponible, reviews vides");
        }

        return FormationWithReviewsDTO.builder()
                .formation(formation)
                .reviews(reviews)
                .build();
    }
    @RabbitListener(queues = "reviewQueue")
    public void receiveMessage(String message) {
        rabbitTraceStore.record("received", "reviewQueue", "gestion-formation", message);
        System.out.println("🔥 MESSAGE REÇU DANS FORMATION : " + message);
    }
}
