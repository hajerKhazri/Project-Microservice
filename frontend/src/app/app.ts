import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagerieService } from './services/messagerie.service';
import { Messagerie } from './models/messagerie.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private messagerieService = inject(MessagerieService);

  protected readonly title = signal('Freelance Chat');
  protected messages = signal<Messagerie[]>([]);
  protected newMessageContent = signal('');
  protected editingMessage = signal<Messagerie | null>(null);
  
  // Mocking IDs for demonstration: Soufia (1) chatting with Maha (2)
  private readonly currentUserId = 1;
  private readonly recipientId = 2;

  ngOnInit() {
    this.loadConversation();
  }

  loadConversation() {
    this.messagerieService.getConversation(this.currentUserId, this.recipientId).subscribe({
      next: (data) => this.messages.set(data),
      error: (err) => console.error('Failed to load messages', err)
    });
  }

  sendMessage() {
    if (!this.newMessageContent().trim()) return;

    const editMsg = this.editingMessage();
    if (editMsg) {
      // Update logic
      const updatedMessage: Messagerie = { ...editMsg, content: this.newMessageContent() };
      this.messagerieService.updateMessage(editMsg.id!, updatedMessage).subscribe({
        next: (data) => {
          this.messages.update(msgs => msgs.map(m => m.id === data.id ? data : m));
          this.cancelEdit();
        },
        error: (err) => console.error('Failed to update message', err)
      });
    } else {
      // Create logic
      const message: Messagerie = {
        idSender: this.currentUserId,
        idReceiver: this.recipientId,
        content: this.newMessageContent(),
      };

      this.messagerieService.sendMessage(message).subscribe({
        next: (savedMessage) => {
          this.messages.update(msgs => [...msgs, savedMessage]);
          this.newMessageContent.set('');
        },
        error: (err) => console.error('Failed to send message', err)
      });
    }
  }

  startEdit(message: Messagerie) {
    this.editingMessage.set(message);
    this.newMessageContent.set(message.content);
  }

  cancelEdit() {
    this.editingMessage.set(null);
    this.newMessageContent.set('');
  }

  deleteMessage(id: number | undefined) {
    if (id === undefined) return;
    this.messagerieService.deleteMessage(id).subscribe({
      next: () => {
        this.messages.update(msgs => msgs.filter(m => m.id !== id));
      },
      error: (err) => console.error('Failed to delete message', err)
    });
  }
}
