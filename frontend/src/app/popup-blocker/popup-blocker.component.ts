import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-popup-blocker',
  templateUrl: './popup-blocker.component.html',
  styleUrls: ['./popup-blocker.component.scss']
})
export class PopupBlockerComponent implements OnInit {

  constructor(private oAuthService : AuthService) { }

  ngOnInit(): void {
    this.oAuthService.signIn();
  }
  login(){
    this.oAuthService.signIn();
  }

}
