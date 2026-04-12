package com.example.serviceprojet.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjetMessageDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDate date;
    private String domaine;
}