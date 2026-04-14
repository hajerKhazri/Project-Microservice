package Evaluation_service.review.feign;



import Evaluation_service.DTO.Formation;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "GESTION-FORMATION")
public interface FormationClient {

    @GetMapping("/api/formations/{id}")
    Formation getFormationById(@PathVariable Long id);
}

