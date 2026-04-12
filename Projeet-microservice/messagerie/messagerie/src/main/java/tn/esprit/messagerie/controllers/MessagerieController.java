package tn.esprit.messagerie.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.messagerie.entities.Messagerie;
import tn.esprit.messagerie.services.MessagerieService;

import java.util.List;

@RestController
@RequestMapping("/api/messageries")
@RequiredArgsConstructor
public class MessagerieController {

    private final MessagerieService messagerieService;

    @PostMapping
    public ResponseEntity<Messagerie> sendMessage(@RequestBody Messagerie messagerie) {
        try {
            Messagerie savedMessage = messagerieService.sendMessage(messagerie);
            return new ResponseEntity<>(savedMessage, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<Messagerie>> getAllMessages() {
        return new ResponseEntity<>(messagerieService.getAllMessages(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Messagerie> getMessageById(@PathVariable Long id) {
        return messagerieService.getMessageById(id)
                .map(message -> new ResponseEntity<>(message, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/conversation/{user1Id}/{user2Id}")
    public ResponseEntity<List<Messagerie>> getConversation(@PathVariable Long user1Id, @PathVariable Long user2Id) {
        return new ResponseEntity<>(messagerieService.getConversation(user1Id, user2Id), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteMessage(@PathVariable Long id) {
        try {
            messagerieService.deleteMessage(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Messagerie> updateMessage(@PathVariable Long id, @RequestBody Messagerie messagerie) {
        try {
            return new ResponseEntity<>(messagerieService.updateMessage(id, messagerie), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
