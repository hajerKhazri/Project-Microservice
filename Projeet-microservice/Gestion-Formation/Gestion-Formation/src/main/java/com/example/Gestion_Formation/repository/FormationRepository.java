package com.example.Gestion_Formation.repository;

import com.example.Gestion_Formation.Entities.Formation;
import com.example.Gestion_Formation.Entities.StatutFormation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Long> {

    long countByStatut(StatutFormation statut);

    List<Formation> findByStatut(StatutFormation statut);
}
