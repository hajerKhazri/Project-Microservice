package com.example.serviceprojet.dto;

import lombok.Data;
import java.util.Date;

@Data
public class ReviewDTO {
    private Long id;
    private Integer score;
    private String comment;
    private String clientName;
    private Long freelancerId;
    private String freelancerName;
    private Date date;
}