package esprit.microservice.Services;

import esprit.microservice.Dto.SkillRequest;
import esprit.microservice.Dto.SkillResponse;
import esprit.microservice.Entities.skills;
import esprit.microservice.Repositories.skillsRepository;
import esprit.microservice.Services.logic.SkillEvaluationService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@AllArgsConstructor
public class ServiceSkillsImplements implements IskillsInterface {

    private final skillsRepository skillsRepository;
    private final SkillEvaluationService skillEvaluationService;

    @Override
    public SkillResponse addSkill(SkillRequest skillRequest) {
        skills skill = new skills();
        skillEvaluationService.applyRequest(skill, skillRequest);

        return skillEvaluationService.toResponse(skillsRepository.save(skill));
    }

    @Override
    public SkillResponse updateSkill(SkillRequest skillRequest) {
        if (skillRequest.getId() == null) {
            throw new IllegalArgumentException("id is required to update a skill.");
        }

        skills skill = findSkillOrThrow(skillRequest.getId());
        skillEvaluationService.applyRequest(skill, skillRequest);

        return skillEvaluationService.toResponse(skillsRepository.save(skill));
    }

    @Override
    public List<SkillResponse> retrieveAllSkills() {
        return skillsRepository.findAll()
                .stream()
                .map(skillEvaluationService::toResponse)
                .toList();
    }

    @Override
    public SkillResponse retrieveSkill(Long id) {
        return skillEvaluationService.toResponse(findSkillOrThrow(id));
    }

    @Override
    public void removeSkill(Long id) {
        skills skill = findSkillOrThrow(id);
        skillsRepository.delete(skill);
    }

    private skills findSkillOrThrow(Long id) {
        return skillsRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Skill with id " + id + " was not found."));
    }
}
