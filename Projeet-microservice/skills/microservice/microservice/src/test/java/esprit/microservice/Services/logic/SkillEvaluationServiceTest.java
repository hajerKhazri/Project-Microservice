package esprit.microservice.Services.logic;

import esprit.microservice.Dto.SkillRequest;
import esprit.microservice.Dto.SkillResponse;
import esprit.microservice.Entities.CertificateStatus;
import esprit.microservice.Entities.CertificateType;
import esprit.microservice.Entities.SkillBadge;
import esprit.microservice.Entities.SkillLevel;
import esprit.microservice.Entities.skills;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SkillEvaluationServiceTest {

    private final SkillEvaluationService skillEvaluationService = new SkillEvaluationService();

    @Test
    void shouldReturnNoCertificateStatusAndNoBonusWhenSkillHasNoCertificate() {
        skills skill = new skills();
        skill.setName("Angular");
        skill.setLevel(SkillLevel.BEGINNER);
        skill.setYearsOfExperience(2);
        skill.setCertificateType(CertificateType.NONE);

        CertificateStatus status = skillEvaluationService.resolveCertificateStatus(skill);
        int score = skillEvaluationService.calculateScore(skill, status);
        SkillBadge badge = skillEvaluationService.resolveBadge(skill, score, status);

        assertEquals(CertificateStatus.NO_CERTIFICATE, status);
        assertEquals(9, score);
        assertEquals(SkillBadge.BEGINNER, badge);
    }

    @Test
    void shouldPromoteAdvancedSkillToCertifiedExpertWhenCertificateIsStillValid() {
        skills skill = new skills();
        skill.setName("Spring Boot");
        skill.setLevel(SkillLevel.ADVANCED);
        skill.setYearsOfExperience(9);
        skill.setCertificateType(CertificateType.CERTIFICATE);
        skill.setCertificateName("Oracle Java Certification");
        skill.setCertificateExpiresAt(LocalDate.now().plusDays(45));

        SkillResponse response = skillEvaluationService.toResponse(skill);

        assertEquals(CertificateStatus.VALID, response.getCertificateStatus());
        assertEquals(43, response.getScore());
        assertEquals(SkillBadge.CERTIFIED_EXPERT, response.getBadge());
    }

    @Test
    void shouldTreatExpiringSoonCertificateAsUsableForScoreAndBadge() {
        skills skill = new skills();
        skill.setName("Microservices");
        skill.setLevel(SkillLevel.EXPERT);
        skill.setYearsOfExperience(6);
        skill.setCertificateType(CertificateType.DIPLOMA);
        skill.setCertificateName("Distributed Systems Diploma");
        skill.setCertificateExpiresAt(LocalDate.now().plusDays(10));

        SkillResponse response = skillEvaluationService.toResponse(skill);

        assertEquals(CertificateStatus.EXPIRING_SOON, response.getCertificateStatus());
        assertEquals(42, response.getScore());
        assertEquals(SkillBadge.CERTIFIED_EXPERT, response.getBadge());
    }

    @Test
    void shouldClearCertificateFieldsWhenRequestUsesNoneType() {
        skills skill = new skills();
        skill.setCertificateType(CertificateType.CERTIFICATE);
        skill.setCertificateName("Old cert");
        skill.setCertificateExpiresAt(LocalDate.now().plusDays(5));

        SkillRequest request = SkillRequest.builder()
                .name("Docker")
                .level(SkillLevel.INTERMEDIATE)
                .yearsOfExperience(3)
                .description("Containers")
                .certificateType(CertificateType.NONE)
                .certificateName("Should be removed")
                .certificateExpiresAt(LocalDate.now().plusDays(100))
                .build();

        skillEvaluationService.applyRequest(skill, request);

        assertEquals(CertificateType.NONE, skill.getCertificateType());
        assertNull(skill.getCertificateName());
        assertNull(skill.getCertificateExpiresAt());
    }

    @Test
    void shouldRejectCertificateWithoutName() {
        SkillRequest request = SkillRequest.builder()
                .name("Kubernetes")
                .level(SkillLevel.ADVANCED)
                .yearsOfExperience(4)
                .certificateType(CertificateType.CERTIFICATE)
                .build();

        assertThrows(IllegalArgumentException.class, () -> skillEvaluationService.applyRequest(new skills(), request));
    }
}
