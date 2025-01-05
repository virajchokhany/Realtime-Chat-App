import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RestService } from '../rest.service';
import { AuthService } from '../auth.service';
import { SocketService } from '../socket.service';
import { ElementRef, ViewChild, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'app-messagedetails',
  templateUrl: './messagedetails.component.html',
  styleUrls: ['./messagedetails.component.scss']
})
export class MessagedetailsComponent implements OnChanges, OnInit{

  @Input() selectedChat: any;

  messages : any = []; // Example messages
  newMessage: string = '';
  userEmail : string = '';
  areMessagesLoading : boolean = false;
  showTypingIndicator : boolean = false;
  typingAnimationPath = 'assets/animations/typing.json';
  typingTimeout: any; // Timeout to stop typing after inactivity
  isTyping : boolean = false; // Flag to track typing status

  constructor(private restService : RestService, private authService : AuthService,private socketService: SocketService) {
  }
  @ViewChild('chatContent') chatContent!: ElementRef;

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.chatContent && this.chatContent.nativeElement) {
          this.chatContent.nativeElement.scrollTop = this.chatContent.nativeElement.scrollHeight;
        }
      }, 0);
    } catch (err) {
      console.error('Failed to scroll to bottom:', err);
    }
  }
  
  ngOnInit(): void {
    this.socketService.newMessage$.subscribe({
      next : (newMessage) =>{
        if(this.selectedChat === undefined || Object.keys(newMessage).length === 0 || this.selectedChat._id !== newMessage.chat._id){
          return;
        }else{
          this.messages.push(newMessage);
          this.scrollToBottom();
        }
      },
      error : (err) => {
        console.error(err);
      }
    })
    this.socketService.typing$.subscribe({
      next : (resp) => {
        if(Object.keys(resp).length === 0)
          return;
        else if(this.selectedChat._id == resp.chatId){
          this.showTypingIndicator = resp.typingStatus;
        }
      }
    })
  }
  onIconClick(){
    console.log("Eye button clicked",this.selectedChat);
  }
  ngOnChanges(){
    if(this.selectedChat === undefined)return;
    this.userEmail = this.authService.getActiveAccount()?.username;
    this.socketService.messages$.subscribe({
      next: (messages) => {
        this.messages = messages; 
        this.areMessagesLoading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Error loading chats:', err); 
        this.areMessagesLoading = false; 
      }
    });
    this.areMessagesLoading = true;
    this.socketService.loadMessages(this.selectedChat._id);
  }
  sendMessage() {
    if (this.newMessage.trim()) {

      this.socketService.sendMessage({
        "content" : this.newMessage,
        "chatId" : this.selectedChat._id
      });
      this.newMessage = '';
    }
  }
  onTyping(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.code === 'Enter') {
      return;
    }
    if (!this.isTyping) {
      this.isTyping = true;
      this.socketService.sendTyping(this.selectedChat);
    }

    clearTimeout(this.typingTimeout);

    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
      this.socketService.sendStopTyping(this.selectedChat);
    }, 2000); 
  }

  getChatName(){
    if(this.selectedChat.isGroupChat){
      return this.selectedChat.chatName;
    }else{
      return this.selectedChat.users.filter((x: { email: string; })=> x.email !== this.userEmail)[0].name;
    }
  }
  

 

}
