package Evaluation_service.Entity;
import lombok.Data;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer score;  // Note du client (1 à 5)

    @Column(length = 1000, nullable = false)
    private String comment; // Commentaire du client

    @Column(nullable = false)
    private String clientName; // Nom du client

    @Column(nullable = false)
    private Long freelancerId; // Id du freelancer évalué

    @Column(length = 100)
    private String freelancerName; // Nom du freelancer (optionnel)

    @Temporal(TemporalType.TIMESTAMP)
    private Date date;  // Date de création

    @PrePersist
    public void onCreate() {
        if (this.date == null) this.date = new Date();
    }
}