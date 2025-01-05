import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

import { MsalGuard } from '@azure/msal-angular';
import { ChatComponent } from './chat/chat.component';
import { GuardService } from './guard.service';
import { LoginsuccessComponent } from './loginsuccess/loginsuccess.component';
import { MessagedetailsComponent } from './messagedetails/messagedetails.component';
const routes: Routes = [
  {
    path:'chat',
    component : ChatComponent,
    canActivate: [
      GuardService
    ],
    data : {
      title : 'Chat'
    }
  },
  {
    path:'home',
    component : HomeComponent,
    canActivate: [
      GuardService
    ],
    data : {
      title : 'Home'
    }
  },
  {
    path:'loginsuccess',
    component : LoginsuccessComponent,
    data : {
      title : 'Login Success'
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
