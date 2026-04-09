package com.example.Gestion_Formation.repository;

import com.example.Gestion_Formation.Entities.FichierFormation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FichierFormationRepository extends JpaRepository<FichierFormation, Long> {

    List<FichierFormation> findByFormationId(Long formationId);
}
