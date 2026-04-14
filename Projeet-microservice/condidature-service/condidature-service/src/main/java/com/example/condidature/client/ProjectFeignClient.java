package com.example.condidature.client;

import com.example.condidature.dto.ProjectDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "service-projet")
public interface ProjectFeignClient {

    @GetMapping("/api/projets/getprojet/{id}")
    boolean exists(@PathVariable("id") Long id);

    @GetMapping("/api/projets/getprojet/{id}")
    ProjectDTO getById(@PathVariable("id") Long id);
}
