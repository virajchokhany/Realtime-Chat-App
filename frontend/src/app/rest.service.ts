import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private baseUrl = '';
  private chatEndPoint = 'api/chat';
  private messageEndpoint = 'api/message';
  private userEndpoint = 'api/user';
  constructor(private http : HttpClient) { 
    this.baseUrl = environment.api;
  }

  getAllChats() : Observable<any>{
    return this.http.get(this.baseUrl + this.chatEndPoint);
  }

  getAllMessagesForChat(chatId:any) : Observable<any>{
    return this.http.get(this.baseUrl+this.messageEndpoint+'/'+chatId);
  }

  getAllUsers(searchKey : string) : Observable<any>{
    return this.http.get(this.baseUrl+this.userEndpoint+'/allUsers?search='+searchKey);
  }

  getOrCreateOneOnOneChat(payload:any) : Observable<any>{
    return this.http.post(this.baseUrl+this.chatEndPoint+"/",payload);
  }

  createNewGroupChat(paylaod : any) : Observable<any> {
    return this.http.post(this.baseUrl+this.chatEndPoint+'/group',paylaod);
  }

}
