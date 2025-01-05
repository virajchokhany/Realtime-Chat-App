import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.scss']
})
export class UserprofileComponent implements OnInit {
  userName: string | undefined;
  userInitials: string | undefined;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const activeAccount = this.authService.getActiveAccount();
    if (activeAccount) {
      this.userName = activeAccount.name; 
      this.userInitials = this.getUserInitials(this.userName);  
    }
  }
   
  getUserInitials(name: string | undefined): string {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map((n) => n[0]).join('');
    return initials.toUpperCase();
  }

  logout(): void {
    this.authService.signOut(); 
  }
}
