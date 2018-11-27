import { Injectable } from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import { Observable } from 'rxjs';
import {AuthService} from '../services/auth.service';
import * as firebase from 'firebase/app';

import {ChatMessage} from '../models/chat-message.model';
import { getDefaultService } from 'selenium-webdriver/chrome';



@Injectable({
  providedIn: 'root'
})
export class ChatService {
  user: firebase.User;
  chatMessages: FirebaseListObservable<ChatMessage[]>;
  chatMessage: ChatMessage;
  userName: Observable<string>;

  constructor(private db: AngularFireDatabase, private afAuth: AngularFireAuth) {

    this.afAuth.authState.subscribe(auth => {
      if(auth !== undefined && auth !== null) {
        this.user = auth;
      }

      this.getUser().subscribe(a => {
        this.userName = a.displayName;
        console.log('auth user: ', this.userName);
      });
    });
  }

    getUser() {
      const userId = this.user.uid;
      const path = `/user/${userId}`;
      return this.db.object(path);
    }

    getUsers() {
      const path = `/user`;
      return this.db.list(path);
    }

  sendMessage(msg: string) {
    const timestamp = this.getTimeStamp();
    const email = this.user.email;
    this.chatMessages = this.getMessages();
    this.chatMessages.push({
        message: msg,
        timeSent: timestamp,
        userName: this.userName,
        email: email
    });

    console.log('CALLED SEND MESSAGE');
  }

  getMessages(): FirebaseListObservable<ChatMessage[]> {
    //query to create our message feed binding
    return this.db.list('messages', {
      query:{
        limitToLast: 25,
        orderByKey: true
      }
    })
  }

  getTimeStamp() {
    const now = new Date();
    const date = now.getUTCFullYear() + '/' +
                  (now.getUTCMonth() + 1) + '/' +
                  now.getUTCDate();
    
    const time = now.getUTCHours() + ':' +
                 now.getUTCMinutes() + ':' +
                 now.getUTCSeconds();

    return (date + ' ' + time);
  }
}
