package esprit.microservice.Services.logic;

import esprit.microservice.Dto.SkillRequest;
import esprit.microservice.Dto.SkillResponse;
import esprit.microservice.Entities.CertificateStatus;
import esprit.microservice.Entities.CertificateType;
import esprit.microservice.Entities.SkillBadge;
import esprit.microservice.Entities.SkillLevel;
import esprit.microservice.Entities.skills;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class SkillEvaluationService {

    private static final int EXPIRING_SOON_DAYS = 30;

    public void applyRequest(skills entity, SkillRequest request) {
        entity.setName(requireText(request.getName(), "Skill name is required."));
        entity.setLevel(request.getLevel() != null ? request.getLevel() : SkillLevel.BEGINNER);
        entity.setYearsOfExperience(normalizeYears(request.getYearsOfExperience()));
        entity.setDescription(trimToNull(request.getDescription()));

        CertificateType certificateType = request.getCertificateType() != null
                ? request.getCertificateType()
                : CertificateType.NONE;
        String certificateName = trimToNull(request.getCertificateName());
        LocalDate certificateExpiresAt = request.getCertificateExpiresAt();

        if (certificateType == CertificateType.NONE) {
            certificateName = null;
            certificateExpiresAt = null;
        } else if (certificateName == null) {
            throw new IllegalArgumentException("certificateName is required when a certificate type is selected.");
        }

        entity.setCertificateType(certificateType);
        entity.setCertificateName(certificateName);
        entity.setCertificateExpiresAt(certificateExpiresAt);
    }

    public SkillResponse toResponse(skills entity) {
        CertificateStatus certificateStatus = resolveCertificateStatus(entity);
        int score = calculateScore(entity, certificateStatus);
        SkillBadge badge = resolveBadge(entity, score, certificateStatus);
        String nextBadgeTarget = resolveNextBadgeTarget(entity, score, badge, certificateStatus);

        return SkillResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .level(entity.getLevel() != null ? entity.getLevel() : SkillLevel.BEGINNER)
                .yearsOfExperience(entity.getYearsOfExperience() != null ? entity.getYearsOfExperience() : 0)
                .description(entity.getDescription())
                .certificateType(entity.getCertificateType() != null ? entity.getCertificateType() : CertificateType.NONE)
                .certificateName(entity.getCertificateName())
                .certificateExpiresAt(entity.getCertificateExpiresAt())
                .certificateStatus(certificateStatus)
                .score(score)
                .badge(badge)
                .nextBadgeTarget(nextBadgeTarget)
                .build();
    }

    public CertificateStatus resolveCertificateStatus(skills entity) {
        boolean hasCertificate = hasCertificate(entity);

        if (!hasCertificate) {
            return CertificateStatus.NO_CERTIFICATE;
        }

        LocalDate expiresAt = entity.getCertificateExpiresAt();

        if (expiresAt == null) {
            return CertificateStatus.VALID;
        }

        LocalDate today = LocalDate.now();

        if (expiresAt.isBefore(today)) {
            return CertificateStatus.EXPIRED;
        }

        if (!expiresAt.isAfter(today.plusDays(EXPIRING_SOON_DAYS))) {
            return CertificateStatus.EXPIRING_SOON;
        }

        return CertificateStatus.VALID;
    }

    public int calculateScore(skills entity, CertificateStatus certificateStatus) {
        int years = entity.getYearsOfExperience() != null ? Math.max(entity.getYearsOfExperience(), 0) : 0;
        int levelWeight = resolveLevelWeight(entity.getLevel());
        int certificateBonus = hasUsableCertificate(certificateStatus) ? 10 : 0;

        return (years * 2) + (levelWeight * 5) + certificateBonus;
    }

    public SkillBadge resolveBadge(skills entity, int score, CertificateStatus certificateStatus) {
        SkillLevel level = entity.getLevel() != null ? entity.getLevel() : SkillLevel.BEGINNER;

        if (hasUsableCertificate(certificateStatus) && score >= 30
                && (level == SkillLevel.ADVANCED || level == SkillLevel.EXPERT)) {
            return SkillBadge.CERTIFIED_EXPERT;
        }

        if (score >= 24 || level == SkillLevel.EXPERT) {
            return SkillBadge.EXPERT;
        }

        if (score >= 12 || level == SkillLevel.INTERMEDIATE || level == SkillLevel.ADVANCED) {
            return SkillBadge.ADVANCED;
        }

        return SkillBadge.BEGINNER;
    }

    public String resolveNextBadgeTarget(skills entity, int score, SkillBadge currentBadge, CertificateStatus certificateStatus) {
        int years = entity.getYearsOfExperience() != null ? Math.max(entity.getYearsOfExperience(), 0) : 0;
        SkillLevel level = entity.getLevel() != null ? entity.getLevel() : SkillLevel.BEGINNER;
        boolean usableCertificate = hasUsableCertificate(certificateStatus);

        return switch (currentBadge) {
            case BEGINNER -> {
                int missingScore = Math.max(0, 12 - score);
                int missingYears = Math.max(0, (int) Math.ceil(missingScore / 2.0));
                yield "Reach ADVANCED by gaining "
                        + Math.max(1, missingYears)
                        + " more year(s) of experience or by increasing your level.";
            }
            case ADVANCED -> {
                int missingScore = Math.max(0, 24 - score);
                int missingYears = Math.max(0, (int) Math.ceil(missingScore / 2.0));

                if (!usableCertificate && (level == SkillLevel.ADVANCED || level == SkillLevel.EXPERT)) {
                    yield "Add a valid certificate and improve your score to move toward EXPERT and CERTIFIED_EXPERT.";
                }

                yield "Reach EXPERT by gaining "
                        + Math.max(1, missingYears)
                        + " more year(s) or by increasing your level.";
            }
            case EXPERT -> {
                if (!usableCertificate) {
                    yield "Add a valid certificate to unlock CERTIFIED_EXPERT.";
                }

                int missingScore = Math.max(0, 30 - score);

                if (missingScore > 0) {
                    int missingYears = Math.max(0, (int) Math.ceil(missingScore / 2.0));
                    yield "Gain " + Math.max(1, missingYears) + " more year(s) or improve your level to reach CERTIFIED_EXPERT.";
                }

                yield "Maintain your certificate valid to keep progressing toward CERTIFIED_EXPERT.";
            }
            case CERTIFIED_EXPERT -> "Highest badge already reached.";
        };
    }

    private boolean hasCertificate(skills entity) {
        return entity.getCertificateType() != null
                && entity.getCertificateType() != CertificateType.NONE
                && trimToNull(entity.getCertificateName()) != null;
    }

    private boolean hasUsableCertificate(CertificateStatus certificateStatus) {
        return certificateStatus == CertificateStatus.VALID
                || certificateStatus == CertificateStatus.EXPIRING_SOON;
    }

    private int resolveLevelWeight(SkillLevel level) {
        SkillLevel safeLevel = level != null ? level : SkillLevel.BEGINNER;

        return switch (safeLevel) {
            case BEGINNER -> 1;
            case INTERMEDIATE -> 2;
            case ADVANCED -> 3;
            case EXPERT -> 4;
        };
    }

    private int normalizeYears(Integer yearsOfExperience) {
        int safeYears = yearsOfExperience != null ? yearsOfExperience : 0;

        if (safeYears < 0) {
            throw new IllegalArgumentException("yearsOfExperience must be greater than or equal to 0.");
        }

        return safeYears;
    }

    private String requireText(String value, String errorMessage) {
        String normalizedValue = trimToNull(value);

        if (normalizedValue == null) {
            throw new IllegalArgumentException(errorMessage);
        }

        return normalizedValue;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmedValue = value.trim();
        return trimmedValue.isEmpty() ? null : trimmedValue;
    }
}
