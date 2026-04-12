package tn.esprit.messagerie.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// The @FeignClient name should match the application name of the User microservice registered in Eureka
@FeignClient(name = "user-service")
public interface UserRestClient {

    @GetMapping("/api/users/{id}")
    Object getUserById(@PathVariable("id") Long id);
}
