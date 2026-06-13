import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private serverUrl = environment.serverUrl;

  constructor(private http: HttpClient) {
    this.socket = io(this.serverUrl);
  }

  getSocketId(): string {
    return this.socket.id ?? '';
  }

  join(name: string) {
    this.socket.emit('join', name);
  }

  getPreviousMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.serverUrl}/messages`);
  }

  sendMessage(message: object) {
    this.socket.emit('sendMessage', message);
  }

  onMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('receiveMessage', (message) => {
        observer.next(message);
      });
    });
  }

  onOnlineCount(): Observable<number> {
    return new Observable(observer => {
      this.socket.on('onlineCount', (count: number) => {
        observer.next(count);
      });
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}