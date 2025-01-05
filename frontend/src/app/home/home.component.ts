import { Component, OnInit } from '@angular/core';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent{

  constructor() { }
  
  selectedChat: any;

  onChatSelected(chat: any) {
    this.selectedChat = chat;
  }

}
