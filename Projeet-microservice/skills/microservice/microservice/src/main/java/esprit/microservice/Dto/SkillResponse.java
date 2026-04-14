package esprit.microservice.Dto;

import esprit.microservice.Entities.CertificateStatus;
import esprit.microservice.Entities.CertificateType;
import esprit.microservice.Entities.SkillBadge;
import esprit.microservice.Entities.SkillLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillResponse {

    private Long id;

    private String name;

    private SkillLevel level;

    private Integer yearsOfExperience;

    private String description;

    private CertificateType certificateType;

    private String certificateName;

    private LocalDate certificateExpiresAt;

    private CertificateStatus certificateStatus;

    private Integer score;

    private SkillBadge badge;

    private String nextBadgeTarget;
}
