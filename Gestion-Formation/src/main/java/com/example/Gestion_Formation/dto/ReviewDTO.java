package com.example.Gestion_Formation.dto;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    private Long id;
    private Integer score;
    private String comment;
    private String clientName;
    private Long formationId;
    private Date date;
}
