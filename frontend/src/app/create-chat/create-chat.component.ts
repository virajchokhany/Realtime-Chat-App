import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RestService } from '../rest.service';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-create-chat',
  templateUrl: './create-chat.component.html',
  styleUrls: ['./create-chat.component.scss']
})
export class CreateChatComponent implements OnInit {

  groupChat: boolean = false;
  searchText: string = '';
  filteredUsers: any[] = [];
  selectedUsers: any[] = [];
  highlightedIndex: number = -1; // For keyboard navigation
  loading = false;
  chatIsGettingCreated = false;
  chatName: string = '';
  allUsers: any[]=[];

  constructor(
    public dialogRef: MatDialogRef<CreateChatComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { groupChat: boolean },
    private http: HttpClient,
    private restService: RestService,
    private socketService : SocketService
  ) {}

  ngOnInit(): void {
    this.groupChat = this.data.groupChat;
    this.restService.getAllUsers(this.searchText).subscribe({
      next: (resp) => {
        this.filteredUsers = resp;
        this.highlightedIndex = this.filteredUsers.length > 0 ? 0 : -1; // Highlight first user
      },
      error: () => {
      }
    });
    this.socketService.chatCreated$.subscribe({
      next : (resp) =>{
        if(Object.keys(resp).length !== 0){
          this.chatIsGettingCreated = false;
        }
      },
      error: (err) => {
        this.chatIsGettingCreated = false;
        console.error(err);
      }
    })
  }

  onSearchChange(): void {
    if (this.searchText.trim() === '') {
      this.restService.getAllUsers(this.searchText).subscribe({
        next: (resp) => {
          this.filteredUsers = resp;
          this.highlightedIndex = this.filteredUsers.length > 0 ? 0 : -1; // Highlight first user
        },
        error: () => {
        }
      });
      return;
    }

    this.loading = true;
    this.restService.getAllUsers(this.searchText).subscribe({
      next: (resp) => {
        this.loading = false;
        this.filteredUsers = resp;
        this.highlightedIndex = this.filteredUsers.length > 0 ? 0 : -1; // Highlight first user
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.filteredUsers.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        this.highlightedIndex =
          (this.highlightedIndex + 1) % this.filteredUsers.length;
        break;
      case 'ArrowUp':
        this.highlightedIndex =
          (this.highlightedIndex - 1 + this.filteredUsers.length) %
          this.filteredUsers.length;
        break;
      case 'Enter':
        if (this.highlightedIndex !== -1) {
          this.selectUser(this.filteredUsers[this.highlightedIndex]);
        }
        break;
      default:
        break;
    }
  }

  selectUser(user: { _id: string; name: string }): void {
    if(this.data.groupChat){ 
      if (!this.selectedUsers.some((u) => u._id === user._id)) {
        this.selectedUsers.push(user);
      }
    }else{
      this.selectedUsers = [];
      this.selectedUsers.push(user);
    }
    this.searchText = '';
    this.restService.getAllUsers(this.searchText).subscribe({
      next: (resp) => {
        this.filteredUsers = resp;
        this.highlightedIndex = this.filteredUsers.length > 0 ? 0 : -1; // Highlight first user
      },
      error: () => {
      }
    });
    this.highlightedIndex = -1; // Reset highlighted index
  }

  removeUser(user: { _id: number; name: string }): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u._id !== user._id);
  }

  onSubmit(): void {
    console.log(this.selectedUsers);
    const payload : any = {
    };

    if(this.data.groupChat){
      const userIdsArray = this.selectedUsers.map((user: { _id: string }) => user._id);
      payload.users = JSON.stringify(userIdsArray)
      payload.name = this.chatName; 
      this.chatIsGettingCreated = true;
      this.socketService.createNewGroupChat(payload);
    }else{
      payload.userId = this.selectedUsers[0]._id;
      this.chatIsGettingCreated = true;
      this.socketService.createNewOneOnOneChat(payload);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  isSubmitDisabled(): boolean {
    if (this.groupChat) { 
      return this.selectedUsers.length < 1 || this.chatName.trim() === ''; 
    } else {
      return this.selectedUsers.length === 0;
    }
  }

}
