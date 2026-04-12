package com.example.condidature;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class CondidatureServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CondidatureServiceApplication.class, args);
    }
}
