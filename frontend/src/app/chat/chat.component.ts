import { Component, EventEmitter, OnChanges, OnInit, Output } from '@angular/core';
import {ChangeDetectionStrategy} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import { Router } from '@angular/router';
import { RestService } from '../rest.service';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateChatComponent } from '../create-chat/create-chat.component';
import { SocketService } from '../socket.service';
import { Socket } from 'socket.io-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnChanges,OnInit{
  
  @Output() chatSelected = new EventEmitter<any>();
  activeChatId: number | null = null;
  searchTerm: string = '';
  chatsAreLoading : boolean = false;
  chats :any;
  dialogRef: any;

  constructor(private restService : RestService,private authService: AuthService,
    private dialog: MatDialog, private socketService: SocketService
  ) { 
  }

  ngOnInit(): void {
    // Subscribe to the chats observable
    this.socketService.chats$.subscribe({
      next: (chats) => {
        this.chats = chats;
        this.chatsAreLoading = false; // Turn off spinner once data is fetched
      },
      error: (err) => {
        console.error('Error loading chats:', err);
        this.chatsAreLoading = false; // Turn off spinner even on error
      }
    });
    this.chatsAreLoading = true;
    this.socketService.loadChats();
    this.socketService.chatCreated$.subscribe({
      next : (resp) =>{
        if(Object.keys(resp).length !== 0){
          if(this.dialogRef!==undefined)
            this.dialogRef.close();
          this.selectChat(resp);
        }
      },
      error: (err) => {
        console.error(err);
      }
    })
  }
  
  getChatName(chat:any){
    if(chat.isGroupChat){
      return chat.chatName;
    }else{
      var name = this.authService.getActiveAccount();
      console.log(name);
      var user = chat.users.filter((x: {
        email: any; name: string 
}) => x?.email !== name?.username);
      console.log(chat);
      return user[0].name;
    }
  }
  ngOnChanges() {
    
  }
  onGroupChatClick(event:any){
   if(event === 'group'){
    this.openDialog(true);
   }else{
    this.openDialog(false);
   }
  }
  openDialog(groupChat: boolean): void {
    this.dialogRef = this.dialog.open(CreateChatComponent, {
      data: { groupChat: groupChat },
      width: '400px', // Explicit width for consistent UI
      height: 'auto'
    });
  }


  selectChat(chat: any) {
    this.activeChatId = chat._id; 
    this.chatSelected.emit(chat);
  }
}
