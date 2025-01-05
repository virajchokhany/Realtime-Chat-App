import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { AppRoutingModule } from './app-routing.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
} from '@azure/msal-browser';

import {
  MSAL_INSTANCE,
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
  MsalService,
  MsalBroadcastService,
  MsalGuard,
  MsalRedirectComponent,
  MsalInterceptor,
  MsalModule,
  MSAL_BROADCAST_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalInterceptorConfiguration,
} from '@azure/msal-angular';


import { msalConfig, loginRequest } from './auth-config';
import { PopupBlockerComponent } from './popup-blocker/popup-blocker.component';
import { LoginsuccessComponent } from './loginsuccess/loginsuccess.component';
import { ChatComponent } from './chat/chat.component';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { MessagedetailsComponent } from './messagedetails/messagedetails.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { CreateChatComponent } from './create-chat/create-chat.component';
import { HttpErrorInterceptor } from './interceptors/http-error.service';

/**
 * Here we pass the configuration parameters to create an MSAL instance.
 * For more info, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/configuration.md
 */
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}
export function playerFactory() {
  return player;
}
/**
 * Set your default interaction type for MSALGuard here. If you have any
 * additional scopes you want the user to consent upon login, add them here as well.
 */
export function MsalGuardConfigurationFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Popup,
    authRequest: loginRequest
  };
}
export function MSALInterceptorConfigFactory():MsalInterceptorConfiguration{
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(environment.api,['api://237e2011-d9cd-4f01-9c8c-7f1b5a8b17ba/user_impersonation']);
  return {
    interactionType:InteractionType.Popup,
    protectedResourceMap
  }
}
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PopupBlockerComponent,
    LoginsuccessComponent,
    ChatComponent,
    UserprofileComponent,
    MessagedetailsComponent,
    CreateChatComponent
  ],
  imports: [
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatTableModule,
    MatMenuModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MsalModule,
    MatSidenavModule,
    LottieModule.forRoot({ player: playerFactory })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MsalGuardConfigurationFactory,
    },
    {
      provide:MSAL_INTERCEPTOR_CONFIG,
      useFactory:MSALInterceptorConfigFactory
    },
    MsalService,
    MsalBroadcastService,
    MsalGuard,
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }, // Add the interceptor
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
