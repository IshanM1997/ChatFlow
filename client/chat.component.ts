import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { SocketService } from '../../../core/services/socket.service';
import { ChatRoomService } from '../../../core/services/chat-room.service';
import { ChatRoom, ChatMessage } from '../../../core/services/auth.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  rooms:       ChatRoom[]    = [];
  activeRoom:  ChatRoom | null = null;
  messages:    ChatMessage[] = [];
  onlineUsers: string[]      = [];
  typingText = '';

  constructor(
    public  auth:       AuthService,
    private socket:     SocketService,
    private roomSvc:    ChatRoomService,
    private router:     Router
  ) {}

  ngOnInit(): void {
    this.socket.connect();
    this.roomSvc.loadRooms();

    this.roomSvc.rooms$.pipe(takeUntil(this.destroy$)).subscribe(rooms => {
      this.rooms = rooms;
      if (rooms.length && !this.activeRoom) this.selectRoom(rooms[0]);
    });

    this.roomSvc.messages$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.activeRoom) {
        this.messages = this.roomSvc.getMessages(this.activeRoom.id);
      }
    });

    this.socket.onlineUsers$.pipe(takeUntil(this.destroy$)).subscribe(ids => {
      this.onlineUsers = ids;
    });

    this.socket.typing$.pipe(takeUntil(this.destroy$)).subscribe(users => {
      const others = users.filter(u => u.userId !== this.auth.currentUser?.id);
      this.typingText = others.length
        ? others.map(u => u.username).join(', ') + (others.length === 1 ? ' is typing…' : ' are typing…')
        : '';
    });
  }

  selectRoom(room: ChatRoom): void {
    this.activeRoom = room;
    this.roomSvc.selectRoom(room.id);
    setTimeout(() => {
      this.messages = this.roomSvc.getMessages(room.id);
    }, 100);
  }

  logout(): void {
    this.socket.disconnect();
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  isOnline(userId: string): boolean { return this.onlineUsers.includes(userId); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
