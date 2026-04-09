package esprit.microservice.Services;

import esprit.microservice.Dto.SkillRequest;
import esprit.microservice.Dto.SkillResponse;

import java.util.List;

public interface IskillsInterface {

    SkillResponse addSkill(SkillRequest skillRequest);

    SkillResponse updateSkill(SkillRequest skillRequest);

    List<SkillResponse> retrieveAllSkills();

    SkillResponse retrieveSkill(Long id);

    void removeSkill(Long id);
}
