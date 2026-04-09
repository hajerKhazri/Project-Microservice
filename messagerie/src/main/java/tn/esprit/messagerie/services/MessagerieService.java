package tn.esprit.messagerie.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.messagerie.entities.Messagerie;
import tn.esprit.messagerie.feign.UserRestClient;
import tn.esprit.messagerie.rabbitmq.MessageProducer;
import tn.esprit.messagerie.repositories.MessagerieRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessagerieService {

    private final MessagerieRepository messagerieRepository;
    private final UserRestClient userRestClient;
    private final MessageProducer messageProducer;

    public Messagerie sendMessage(Messagerie messagerie) {
        // Filter sensitive content
        messagerie.setContent(filterContent(messagerie.getContent()));

        try {
            Object receiver = userRestClient.getUserById(messagerie.getIdReceiver());
            log.info("Receiver details fetched via OpenFeign: {}", receiver);
        } catch (Exception e) {
            log.warn("Could not fetch receiver details via OpenFeign. Is user-service running?");
        }

        Messagerie savedMessage = messagerieRepository.save(messagerie);

        // Scenario 2: Asynchronous communication via RabbitMQ
        try {
            messageProducer.sendMessageNotification(savedMessage);
        } catch (Exception e) {
            log.error("Failed to send RabbitMQ notification: {}", e.getMessage());
        }

        return savedMessage;
    }

    public List<Messagerie> getAllMessages() {
        return messagerieRepository.findAll();
    }

    public Optional<Messagerie> getMessageById(Long id) {
        return messagerieRepository.findById(id);
    }

    public List<Messagerie> getConversation(Long user1Id, Long user2Id) {
        return messagerieRepository.findByIdSenderAndIdReceiverOrIdSenderAndIdReceiverOrderBySentAtAsc(
                user1Id, user2Id, user2Id, user1Id);
    }

    public void deleteMessage(Long id) {
        messagerieRepository.deleteById(id);
    }

    public Messagerie updateMessage(Long id, Messagerie messageDetails) {
        return messagerieRepository.findById(id).map(message -> {
            // Filter sensitive content
            message.setContent(filterContent(messageDetails.getContent()));
            return messagerieRepository.save(message);
        }).orElseThrow(() -> new RuntimeException("Message not found with id " + id));
    }

    private String filterContent(String content) {
        if (content == null) return null;

        String emailRegex = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}";
        String phoneRegex = "\\+?[0-9]{8,15}";
        String urlRegex = "(https?://|www\\.)[^\\s/$.?#].[^\\s]*";

        String censoredContent = content.replaceAll(emailRegex, "***");
        censoredContent = censoredContent.replaceAll(phoneRegex, "***");
        censoredContent = censoredContent.replaceAll(urlRegex, "***");

        return censoredContent;
    }
}
