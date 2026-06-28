import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { ChatMessage, ChatRoom, TypingUser } from './auth.model';

interface SocketEvent { event: string; data: unknown; }

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket!: Socket;
  private events$ = new Subject<SocketEvent>();

  private connectedSubject  = new BehaviorSubject<boolean>(false);
  private onlineUsersSubject = new BehaviorSubject<string[]>([]);
  private typingSubject     = new BehaviorSubject<TypingUser[]>([]);

  connected$   = this.connectedSubject.asObservable();
  onlineUsers$ = this.onlineUsersSubject.asObservable();
  typing$      = this.typingSubject.asObservable();

  constructor(private auth: AuthService) {}

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:3000', {
      auth: { token: this.auth.accessToken },
      transports: ['websocket'],
    });

    this.socket.on('connect',    () => this.connectedSubject.next(true));
    this.socket.on('disconnect', () => this.connectedSubject.next(false));

    const pipe = (event: string) =>
      this.socket.on(event, (data: unknown) => this.events$.next({ event, data }));

    pipe('new_message');
    pipe('room_history');
    pipe('message_read');

    this.socket.on('online_users',     (ids: string[]) => this.onlineUsersSubject.next(ids));
    this.socket.on('user_typing',      (u: TypingUser) => {
      const cur = this.typingSubject.value;
      if (!cur.find(x => x.userId === u.userId)) this.typingSubject.next([...cur, u]);
    });
    this.socket.on('user_stop_typing', ({ userId }: { userId: string }) => {
      this.typingSubject.next(this.typingSubject.value.filter(u => u.userId !== userId));
    });
  }

  disconnect(): void { this.socket?.disconnect(); }

  on<T>(event: string): Observable<T> {
    return this.events$.pipe(
      filter(e => e.event === event),
      map(e => e.data as T)
    );
  }

  joinRoom(roomId: string): void { this.socket.emit('join_room', roomId); }
  sendMessage(roomId: string, text: string): void { this.socket.emit('send_message', { roomId, text }); }
  startTyping(roomId: string): void { this.socket.emit('typing_start', roomId); }
  stopTyping(roomId: string): void  { this.socket.emit('typing_stop', roomId); }
  markRead(roomId: string, messageId: string): void { this.socket.emit('mark_read', { roomId, messageId }); }

  ngOnDestroy(): void { this.disconnect(); }
}
