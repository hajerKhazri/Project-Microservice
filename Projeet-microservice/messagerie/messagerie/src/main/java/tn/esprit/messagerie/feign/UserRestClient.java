package tn.esprit.messagerie.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// Use a direct URL because the Django user-service is not registered in Eureka.
@FeignClient(name = "user-service", url = "${USER_SERVICE_URL:http://localhost:8000}")
public interface UserRestClient {

    @GetMapping("/api/users/{id}")
    Object getUserById(@PathVariable("id") Long id);
}
