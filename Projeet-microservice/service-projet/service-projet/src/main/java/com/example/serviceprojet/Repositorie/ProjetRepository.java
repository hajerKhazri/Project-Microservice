package com.example.serviceprojet.Repositorie;
import com.example.serviceprojet.entite.Domaine;
import com.example.serviceprojet.entite.Projet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjetRepository extends JpaRepository<Projet, Long> {
    List<Projet> findByDomaine(Domaine domaine);
    List<Projet> findByTitleContainingIgnoreCase(String title);
}
