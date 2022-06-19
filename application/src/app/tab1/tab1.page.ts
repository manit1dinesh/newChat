import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

import firebase from 'firebase/compat/app'
import * as firebaseui from 'firebaseui';
import { DataService } from '../services/data.service';
import { getAuth, onAuthStateChanged } from "firebase/auth";


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  currentUser;
  constructor(private router: Router, private dataService: DataService) { }

  toChat() {
    this.router.navigate(['/chat']);
  }

  ngOnInit(): void {
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    var uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
          return true;
        },
        uiShown: function () {
          document.getElementById('loader').style.display = 'none';
        }
      },
      signInFlow: 'redirect',
      // signInSuccess: function () {
      //   console.log('success')
      // },
      // signInFailure: function () {
      //   console.log('failier')
      // },
      signInSuccessUrl: '/chat',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      ],
    };
    ui.start('#firebaseui-auth-container', uiConfig);


    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      console.log(user.displayName);
      if (user) {
        this.dataService.currentUserName.next(user.displayName);
      } else {
        this.router.navigate(['tab1']);
      }
    });
  };

}
