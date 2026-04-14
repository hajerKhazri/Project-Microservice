package com.example.Gestion_Formation.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "formations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    @Column(nullable = false, length = 180)
    private String titre;

    @Column(length = 4000)
    private String description;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StatutFormation statut;

    @Min(value = 0, message = "L'avancement minimum est 0")
    @Max(value = 100, message = "L'avancement maximum est 100")
    @Column
    private Integer avancement;

    @OneToMany(mappedBy = "formation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FichierFormation> fichiers = new ArrayList<>();

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (avancement == null) avancement = 0;
        if (statut == null) statut = StatutFormation.PLANIFIE;
    }
}
