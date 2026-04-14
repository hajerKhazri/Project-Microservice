package com.example.Gestion_Formation.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fichiers_formation")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FichierFormation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomFichier;

    @Column(nullable = false)
    private String cheminFichier;

    private String typeFichier;

    private Long tailleFichier;

    private LocalDateTime dateUpload;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formation_id", nullable = false)
    @JsonIgnore
    private Formation formation;

    @PrePersist
    public void prePersist() {
        if (dateUpload == null) dateUpload = LocalDateTime.now();
    }
}
