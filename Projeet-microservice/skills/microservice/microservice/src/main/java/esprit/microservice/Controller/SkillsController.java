package esprit.microservice.Controller;

import esprit.microservice.Dto.SkillRequest;
import esprit.microservice.Dto.SkillResponse;
import esprit.microservice.Services.IskillsInterface;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/skills")
@CrossOrigin(origins = "*")
public class SkillsController {

    private final IskillsInterface iskillsInterface;

    @PostMapping("/add")
    public SkillResponse addSkill(@RequestBody SkillRequest skillRequest) {
        return iskillsInterface.addSkill(skillRequest);
    }

    @PutMapping("/update")
    public SkillResponse updateSkill(@RequestBody SkillRequest skillRequest) {
        return iskillsInterface.updateSkill(skillRequest);
    }

    @GetMapping("/all")
    public List<SkillResponse> getAllSkills() {
        return iskillsInterface.retrieveAllSkills();
    }

    @GetMapping("/{id}")
    public SkillResponse getSkillById(@PathVariable Long id) {
        return iskillsInterface.retrieveSkill(id);
    }

    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSkill(@PathVariable Long id) {
        iskillsInterface.removeSkill(id);
    }
    @GetMapping("/test/{id}")
    public String getSkillInfo(@PathVariable Long id) {
        return "Skill trouvé avec id = " + id;
    }
}
