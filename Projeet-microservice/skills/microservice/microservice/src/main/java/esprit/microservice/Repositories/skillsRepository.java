package esprit.microservice.Repositories;

import esprit.microservice.Entities.skills;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface skillsRepository extends JpaRepository<skills, Long> {


}