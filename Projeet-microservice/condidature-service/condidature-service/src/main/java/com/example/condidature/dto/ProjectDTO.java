package com.example.condidature.dto;

import lombok.Data;

@Data
public class ProjectDTO {
    private Long id;
    private String title;
    private String status;
    private Integer maxCapacity;
}
