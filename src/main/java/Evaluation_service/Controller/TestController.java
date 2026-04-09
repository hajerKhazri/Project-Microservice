package Evaluation_service.Controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/")
    public String home() {
        return "Review service is running 🚀";
    }
    @Value("${server.port}")
    private String port;

    @GetMapping("/port")
    public String getPort() {
        return "Port = " + port;
    }

}
