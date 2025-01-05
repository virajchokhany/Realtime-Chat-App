import { Injectable } from '@angular/core';
import { log } from 'console';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { RestService } from './rest.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  // To store all chats
  private chatsSubject = new BehaviorSubject<any[]>([]);
  chats$ = this.chatsSubject.asObservable();

  // To store messages for the current chat
  private messagesSubject = new BehaviorSubject<any[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private newMessageSubject = new BehaviorSubject<any>({});
  newMessage$ = this.newMessageSubject.asObservable();

  private typingSubject = new BehaviorSubject<any>({});
  typing$ = this.typingSubject.asObservable();

  private chatCreatedSubject = new BehaviorSubject<any>({});
  chatCreated$ = this.chatCreatedSubject.asObservable();

  constructor(private restService : RestService) {
    // Get the stored item from sessionStorage
    const msalTokenKey = `msal.token.keys.237e2011-d9cd-4f01-9c8c-7f1b5a8b17ba`; // Replace with your actual key
    const storedItem = sessionStorage.getItem(msalTokenKey);

    let parsedItem = storedItem ? JSON.parse(storedItem) : null;

    // Access the accessToken if it exists
    const accessToken = parsedItem ? parsedItem.accessToken : null;
    const token = sessionStorage.getItem(accessToken[0]);
    const accessTokenParsed = token ? JSON.parse(token) : null;
    let secret = accessTokenParsed.secret;
    console.log(secret,"Access Token");
    // Create the socket connection
    this.socket = io('wss://realtime-chat-app-8f5k.onrender.com', {
      auth: {
        token: secret, // Ensure secret is a string
      },
      reconnection: true, // Enable reconnection
      reconnectionAttempts: 1, // Limit the number of reconnection attempts
    });
    this.updateChat();
    this.typing();
    this.stopTyping();
    this.chatCreated();
  }
  // Fetch the initial list of chats from the server
  loadChats() {
    this.restService.getAllChats().subscribe({
      next: (resp) => {
        this.chatsSubject.next(resp); // Update the chats observable
      },
      error: (err) => {
        console.error('Error fetching chats:', err);
      }
    });
  }

  // Load messages for a specific chat (called when opening a chat)
  loadMessages(chatId: string) {
    this.restService.getAllMessagesForChat(chatId).subscribe({
      next : (resp) => {
        this.messagesSubject.next(resp);
      },
      error: (err) => {
        console.error('Error fetching chats:', err);
      }
    })
  }
  typing(){
    this.socket.on('typing',(chatId) => {
      this.typingSubject.next({
        "typingStatus" : true,
        "chatId" : chatId
      });
    });
  }
  stopTyping(){
    this.socket.on('stopTyping',(chatId) => {
      this.typingSubject.next({
        "typingStatus" : false,
        "chatId" : chatId
      });
    });
  }
  sendMessage(data: any) {
    this.socket.emit('sendMessage', data);
  }
  sendTyping(data : any){
    this.socket.emit('typing',data);
  }
  sendStopTyping(data:any){
    this.socket.emit('stopTyping',data);
  }
  updateChat(){
    this.socket.on('updateChatAfterMessageSent',(data) => {
      const { message, chat } = data;
      const currentChats = this.chatsSubject.getValue(); 
      var updatedChats = this.chatsSubject.getValue().filter(c => c._id !== chat._id);
      updatedChats.unshift(chat);
      this.chatsSubject.next(updatedChats);
      this.newMessageSubject.next(message);
    });
  }

  createNewOneOnOneChat(data:any){
    this.socket.emit('newOneOnOneChatCreated',data);
  }
  createNewGroupChat(data:any){
    this.socket.emit('newGroupChatCreated',data);
  }
  chatCreated(){
    this.socket.on('chatCreated',(data)=>{
      this.chatCreatedSubject.next(data);
      var updatedChats = this.chatsSubject.getValue().filter(c => c._id !== data._id);
      updatedChats.unshift(data);
      this.chatsSubject.next(updatedChats);
    });
  }
  // Disconnect socket
  disconnect() {
    this.socket.disconnect();
  }
}
