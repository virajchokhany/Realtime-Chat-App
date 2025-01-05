import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import {AuthenticationResult} from '@azure/msal-browser';
import {Router} from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginStateSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  loginState$ = this.loginStateSubject.asObservable(); // Observable to subscribe to login state changes

  constructor(private route : Router ,
    private msalService : MsalService) { }

  signIn(){
    var state = location.pathname + location.search;
    let loginRequest = {
      scopes: ['api://237e2011-d9cd-4f01-9c8c-7f1b5a8b17ba/user_impersonation'],
      state : state
    }
    this.msalService.loginPopup(loginRequest)
      .subscribe((response : AuthenticationResult) => {
        this.msalService.instance.setActiveAccount(response.account);
        this.loginStateSubject.next(this.isLoggedIn());
        if(response.state == "/"){
          this.route.navigate(['/home'])
        }else{
          this.route.navigateByUrl(state);
        }
      });
      return this.msalService.instance.getActiveAccount() != null;
  }

  signOut(){
    this.msalService.logoutRedirect();
    this.loginStateSubject.next(false);
  }
  getActiveAccount() : any{
    return this.msalService.instance.getActiveAccount();  
  }
  
  isLoggedIn() : boolean {
    return this.msalService.instance.getActiveAccount()!=null;
  }
}
