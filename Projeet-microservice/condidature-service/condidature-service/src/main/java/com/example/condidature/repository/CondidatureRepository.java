package com.example.condidature.repository;

import com.example.condidature.entity.Condidature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CondidatureRepository extends JpaRepository<Condidature, Long> {
    List<Condidature> findByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, String status);
}
