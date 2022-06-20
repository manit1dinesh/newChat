import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { io } from 'socket.io-client';
import { DataService } from '../services/data.service';
import firebase from 'firebase/compat/app';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Router } from '@angular/router';



@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  constructor(private dataService: DataService, private router: Router, private renderer: Renderer2) { }
  socket = io('http://localhost:3000')
  name;
  msg;
  @ViewChild('textarea') textarea: ElementRef
  @ViewChild('messageArea') messageArea: ElementRef
  
  ngOnInit(): void {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      this.name = user.displayName;
      if (user) {
        /////////////////////////
      } else {
        this.router.navigate(['tab1']);
      }
    });
    
    
   // Recieve messages 
this.socket.on('message', (msg) => {
  this.appendMessage(msg, 'incoming')
  this.scrollToBottom()
})
    
  }
  
  onKeyUp(e) {
    if (e.key === 'Enter') {
      this.sendMessage(e.target.value)
    }
  }
  
  sendMessage(message) {
    let msg = {
        user: this.name,
        message: message.trim()
    }
    // Append 
    this.appendMessage(msg, 'outgoing')
    this.textarea.nativeElement.value = ''
    this.scrollToBottom()

    // Send to server 
    this.socket.emit('message', msg)

}
  
appendMessage(msg, type) {
  const mainDiv = this.renderer.createElement('div') as HTMLDivElement;
  this.renderer.addClass(mainDiv, 'message');
  this.renderer.addClass(mainDiv, type);

  let markup = `
      <h4>${msg.user}</h4>
      <p>${msg.message}</p>
  `
  mainDiv.innerHTML = markup
  this.messageArea.nativeElement.appendChild(mainDiv)
}
  
  

  scrollToBottom() {
    this.messageArea.nativeElement.scrollTop = this.messageArea.nativeElement.scrollHeight
  }


}
