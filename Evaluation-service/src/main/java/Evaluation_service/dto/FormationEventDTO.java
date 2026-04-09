package Evaluation_service.dto;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormationEventDTO implements Serializable {
    private Long formationId;
    private String titre;
    private String description;
    private String eventType; // CREATED, UPDATED, DELETED
}
