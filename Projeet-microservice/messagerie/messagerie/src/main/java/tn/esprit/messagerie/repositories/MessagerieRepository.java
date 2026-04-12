package tn.esprit.messagerie.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.messagerie.entities.Messagerie;

import java.util.List;

@Repository
public interface MessagerieRepository extends JpaRepository<Messagerie, Long> {
    List<Messagerie> findByIdSenderOrIdReceiver(Long idSender, Long idReceiver);

    List<Messagerie> findByIdSenderAndIdReceiverOrIdSenderAndIdReceiverOrderBySentAtAsc(Long idSender1,
            Long idReceiver1, Long idSender2, Long idReceiver2);
}
