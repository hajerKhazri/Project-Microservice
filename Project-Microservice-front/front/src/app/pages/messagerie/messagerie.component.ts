import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { MessagerieService } from '../../services/messagerie.service';
import { UsersService } from '../../services/users.service';
import { SessionService } from '../../core/services/session.service';
import { Messagerie } from '../../models/messagerie.model';
import { AppUser } from '../../models/user.model';

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messagerie.component.html',
  styleUrl: './messagerie.component.css',
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger('50ms', animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true })
      ])
    ]),
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ])
  ]
})
export class MessagerieComponent implements OnInit {
  private readonly messagerieService = inject(MessagerieService);
  private readonly usersService = inject(UsersService);
  private readonly sessionService = inject(SessionService);

  readonly currentUser = computed(() => this.sessionService.getCurrentUser());
  readonly users = signal<AppUser[]>([]);
  readonly messages = signal<Messagerie[]>([]);
  readonly selectedUser = signal<AppUser | null>(null);
  readonly newMessageContent = signal('');
  readonly editingMessage = signal<Messagerie | null>(null);
  readonly loading = signal(false);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.usersService.getAll().subscribe({
      next: (data) => {
        // Exclude current user from the list
        const me = this.currentUser();
        this.users.set(data.filter(u => u.id !== me?.id));
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  selectUser(user: AppUser) {
    this.cancelEdit();
    this.selectedUser.set(user);
    this.loadConversation();
  }

  loadConversation() {
    const me = this.currentUser();
    const other = this.selectedUser();
    if (!me || !other) return;

    this.loading.set(true);
    this.messagerieService.getConversation(me.id, other.id).subscribe({
      next: (data) => {
        this.messages.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load messages', err);
        this.loading.set(false);
      }
    });
  }

  startEdit(msg: Messagerie) {
    this.editingMessage.set(msg);
    this.newMessageContent.set(msg.content);
  }

  cancelEdit() {
    this.editingMessage.set(null);
    this.newMessageContent.set('');
  }

  sendMessage() {
    const me = this.currentUser();
    const other = this.selectedUser();
    const content = this.newMessageContent().trim();
    const editing = this.editingMessage();

    if (!me || !other || !content) return;

    if (editing && editing.id) {
      // Logic for Update
      const updatedMessage: Messagerie = { ...editing, content };
      this.messagerieService.updateMessage(editing.id, updatedMessage).subscribe({
        next: (saved) => {
          this.messages.update(msgs => msgs.map(m => m.id === saved.id ? saved : m));
          this.cancelEdit();
        },
        error: (err) => console.error('Failed to update message', err)
      });
    } else {
      // Logic for Create
      const message: Messagerie = {
        idSender: me.id,
        idReceiver: other.id,
        content: content
      };

      this.messagerieService.sendMessage(message).subscribe({
        next: (saved) => {
          this.messages.update(msgs => [...msgs, saved]);
          this.newMessageContent.set('');
        },
        error: (err) => console.error('Failed to send message', err)
      });
    }
  }

  deleteMessage(id: number | undefined) {
    if (!id) return;
    this.messagerieService.deleteMessage(id).subscribe({
      next: () => {
        this.messages.update(msgs => msgs.filter(m => m.id !== id));
      },
      error: (err) => console.error('Failed to delete message', err)
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getGradient(id: number): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
    ];
    return gradients[id % gradients.length];
  }
}
