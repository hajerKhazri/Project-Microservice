package com.example.Gestion_Formation.service;

import com.example.Gestion_Formation.Entities.FichierFormation;
import com.example.Gestion_Formation.Entities.Formation;
import com.example.Gestion_Formation.repository.FichierFormationRepository;
import com.example.Gestion_Formation.repository.FormationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class FichierFormationService {

    private final FichierFormationRepository fichierRepository;
    private final FormationRepository formationRepository;
    private final Path storageLocation;

    public FichierFormationService(
            FichierFormationRepository fichierRepository,
            FormationRepository formationRepository,
            @Value("${app.upload.dir:uploads}") String uploadDir) {
        this.fichierRepository = fichierRepository;
        this.formationRepository = formationRepository;
        this.storageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire d'upload", e);
        }
    }

    public FichierFormation upload(Long formationId, MultipartFile file) throws IOException {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation introuvable : " + formationId));

        String originalName = file.getOriginalFilename();
        String uniqueName = UUID.randomUUID() + "_" + originalName;
        Path targetPath = this.storageLocation.resolve(uniqueName);

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        FichierFormation fichier = FichierFormation.builder()
                .nomFichier(originalName)
                .cheminFichier(uniqueName)
                .typeFichier(file.getContentType())
                .tailleFichier(file.getSize())
                .formation(formation)
                .build();

        return fichierRepository.save(fichier);
    }

    public List<FichierFormation> getByFormation(Long formationId) {
        if (!formationRepository.existsById(formationId)) {
            throw new RuntimeException("Formation introuvable : " + formationId);
        }
        return fichierRepository.findByFormationId(formationId);
    }

    public Resource download(Long fichierId) {
        FichierFormation fichier = fichierRepository.findById(fichierId)
                .orElseThrow(() -> new RuntimeException("Fichier introuvable : " + fichierId));
        try {
            Path filePath = this.storageLocation.resolve(fichier.getCheminFichier()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new RuntimeException("Fichier non trouvé sur le disque : " + fichier.getNomFichier());
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Erreur lors du chargement du fichier", e);
        }
    }

    public void delete(Long fichierId) {
        FichierFormation fichier = fichierRepository.findById(fichierId)
                .orElseThrow(() -> new RuntimeException("Fichier introuvable : " + fichierId));
        try {
            Path filePath = this.storageLocation.resolve(fichier.getCheminFichier()).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la suppression du fichier", e);
        }
        fichierRepository.delete(fichier);
    }
}
