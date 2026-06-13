import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SocketService } from '../services/socket';

interface Message {
  id: number;
  text: string;
  sent: boolean;
  senderId: string;
  senderName: string;
  time: string;
}

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
  messages = signal<Message[]>([]);
  newMessage = '';
  nameInput = '';
  userName = '';
  onlineCount = signal(0);
  private subscription!: Subscription;
  private onlineSubscription!: Subscription;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.subscription = this.socketService.onMessage().subscribe((message: Message) => {
      const isSent = message.senderId === this.socketService.getSocketId();
      this.messages.update(msgs => [...msgs, { ...message, sent: isSent }]);
    });
  }

  joinChat() {
    if (!this.nameInput.trim()) return;
    this.userName = this.nameInput.trim();
    this.socketService.join(this.userName);

    this.socketService.getPreviousMessages().subscribe((messages: any[]) => {
      const previous = messages.map(msg => ({
        id: msg._id,
        text: msg.text,
        senderName: msg.senderName,
        senderId: msg.senderId,
        time: msg.time,
        sent: false
      }));
      this.messages.set(previous);
    });

    this.onlineSubscription = this.socketService.onOnlineCount().subscribe((count: number) => {
      this.onlineCount.set(count);
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: this.newMessage,
      senderName: this.userName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.socketService.sendMessage(message);
    this.newMessage = '';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.onlineSubscription.unsubscribe();
    this.socketService.disconnect();
  }
}