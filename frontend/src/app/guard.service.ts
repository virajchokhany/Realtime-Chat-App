import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GuardService {

  constructor(private oAuthService : AuthService) { }

  canActivate() : Observable<boolean> | Promise<boolean> | boolean{
    if(this.oAuthService.isLoggedIn()){
      return true;
    }
    this.oAuthService.signIn();
    return false;
  }
}
