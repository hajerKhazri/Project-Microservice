package com.example.Gestion_Formation.controller;

import com.example.Gestion_Formation.Entities.FichierFormation;
import com.example.Gestion_Formation.service.FichierFormationService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/formations/{formationId}/fichiers")
public class FichierFormationController {

    private final FichierFormationService fichierService;

    public FichierFormationController(FichierFormationService fichierService) {
        this.fichierService = fichierService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FichierFormation> upload(
            @PathVariable Long formationId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(fichierService.upload(formationId, file));
    }

    @GetMapping
    public ResponseEntity<List<FichierFormation>> list(@PathVariable Long formationId) {
        return ResponseEntity.ok(fichierService.getByFormation(formationId));
    }

    @GetMapping("/{fichierId}/download")
    public ResponseEntity<Resource> download(@PathVariable Long formationId, @PathVariable Long fichierId) {
        Resource resource = fichierService.download(fichierId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{fichierId}")
    public ResponseEntity<Void> delete(@PathVariable Long formationId, @PathVariable Long fichierId) {
        fichierService.delete(fichierId);
        return ResponseEntity.noContent().build();
    }
}
