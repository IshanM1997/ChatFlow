import { Component, Input, OnChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ChatMessage, ChatRoom } from '../../../core/services/auth.model';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-message-area',
  templateUrl: './message-area.component.html',
  styleUrls: ['./message-area.component.scss']
})
export class MessageAreaComponent implements OnChanges, AfterViewChecked {
  @Input() room!: ChatRoom;
  @Input() messages: ChatMessage[] = [];
  @Input() currentUserId = '';
  @Input() typingText = '';

  @ViewChild('messagesEnd') private messagesEnd!: ElementRef;

  text = '';
  private typingInput$ = new Subject<string>();
  private shouldScroll = false;

  constructor(private socket: SocketService) {
    this.typingInput$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(val => {
      if (val) this.socket.startTyping(this.room.id);
      else     this.socket.stopTyping(this.room.id);
    });
  }

  ngOnChanges(): void { this.shouldScroll = true; }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  onInput(val: string): void { this.typingInput$.next(val); }

  send(): void {
    const text = this.text.trim();
    if (!text || !this.room) return;
    this.socket.sendMessage(this.room.id, text);
    this.socket.stopTyping(this.room.id);
    this.text = '';
    this.typingInput$.next('');
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }

  isOwn(msg: ChatMessage):      boolean { return msg.userId === this.currentUserId; }
  isRead(msg: ChatMessage):     boolean { return msg.readBy.filter(id => id !== this.currentUserId).length > 0; }
  formatTime(iso: string):      string  { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

  private scrollToBottom(): void {
    try { this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }
}
