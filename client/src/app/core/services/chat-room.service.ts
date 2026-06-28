import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage, ChatRoom } from './auth.model';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class ChatRoomService {
  private roomsSubject   = new BehaviorSubject<ChatRoom[]>([]);
  private messagesSubject = new BehaviorSubject<Map<string, ChatMessage[]>>(new Map());
  private activeRoomId   = new BehaviorSubject<string | null>(null);

  rooms$      = this.roomsSubject.asObservable();
  messages$   = this.messagesSubject.asObservable();
  activeRoom$ = this.activeRoomId.asObservable();

  constructor(private http: HttpClient, private socket: SocketService) {
    this.listenMessages();
  }

  loadRooms(): void {
    this.http.get<ChatRoom[]>('http://localhost:3000/api/rooms').subscribe(
      rooms => this.roomsSubject.next(rooms)
    );
  }

  selectRoom(roomId: string): void {
    this.activeRoomId.next(roomId);
    this.socket.joinRoom(roomId);
  }

  getMessages(roomId: string): ChatMessage[] {
    return this.messagesSubject.value.get(roomId) ?? [];
  }

  private listenMessages(): void {
    this.socket.on<{ roomId: string; messages: ChatMessage[] }>('room_history').subscribe(
      ({ roomId, messages }) => this.setMessages(roomId, messages)
    );

    this.socket.on<ChatMessage>('new_message').subscribe(msg => {
      const map  = new Map(this.messagesSubject.value);
      const prev = map.get(msg.roomId) ?? [];
      map.set(msg.roomId, [...prev, msg]);
      this.messagesSubject.next(map);
    });

    this.socket.on<{ messageId: string; userId: string }>('message_read').subscribe(
      ({ messageId, userId }) => {
        const map = new Map(this.messagesSubject.value);
        map.forEach((msgs, roomId) => {
          const updated = msgs.map(m =>
            m.id === messageId && !m.readBy.includes(userId)
              ? { ...m, readBy: [...m.readBy, userId] }
              : m
          );
          map.set(roomId, updated);
        });
        this.messagesSubject.next(map);
      }
    );
  }

  private setMessages(roomId: string, msgs: ChatMessage[]): void {
    const map = new Map(this.messagesSubject.value);
    map.set(roomId, msgs);
    this.messagesSubject.next(map);
  }
}
