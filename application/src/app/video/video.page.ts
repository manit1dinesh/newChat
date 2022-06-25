import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActionSheetController } from '@ionic/angular';
import { io } from "socket.io-client";

@Component({
  selector: 'app-video',
  templateUrl: './video.page.html',
  styleUrls: ['./video.page.scss'],
})
export class VideoPage implements OnInit {
  socket = io("http://localhost:3000");
  roomNumber;
  localStream;
  remoteStream;
  rtcPeerConnection;
  isCaller = true;
  full = false;
  
  isRecording = false; 
  mediaRecorder;
  localScreenStream;
  chunks = [];
  

  @ViewChild('localVideo') localVideo: ElementRef;
  @ViewChild('remoteVideo') remoteVideo: ElementRef;
  @ViewChild('videoScreenEl') videoScreenEl: ElementRef
  @ViewChild('downloadLink') downloadLink: ElementRef
    
  iceServers = {
    iceServers: [
      { 'urls': 'stun:stun.services.mozilla.com' },
      { 'urls': 'stun:stun.l.google.com:19302' }
    ],
  }

  localStreamConstraints = {
    video: { width: 300, height: 400 },
    audio: { echoCancellation: true, noiseSuppression: true }
  }
  remoteStreamConstraints = {
    video: { width: 300, height: 400 },
    audio: { echoCancellation: true, noiseSuppression: true }
  }

  constructor() { }

  onSubmit(f: NgForm) {
    if (f.value.room === '') {
      alert('please type a room name');
    } else {
      this.roomNumber = f.value.room;
      console.log('room name: ', this.roomNumber);
      this.socket.emit('createOrJoin', this.roomNumber);
    }

    this.socket.on('full', data => {
      this.full = data;
    })


    this.socket.on('created', room => {
      navigator.mediaDevices.getUserMedia(this.localStreamConstraints)
        .then(stream => {
          this.localStream = stream;
          this.localVideo.nativeElement.srcObject = stream;
          this.isCaller = true;
        })
        .catch(err => { console.log('error in capturing video', err) })
    });

    this.socket.on('joined', room => {
      console.log('joined');
      navigator.mediaDevices.getUserMedia(this.remoteStreamConstraints)
        .then(stream => {
          this.localStream = stream;
          this.localVideo.nativeElement.srcObject = stream;
          this.socket.emit('ready', this.roomNumber);
        })
        .catch(err => { console.log('error in capturing video', err) })
    });

    this.socket.on('ready', () => {
      console.log('ready out', this.isCaller);
      if (this.isCaller == true) {
        console.log('ready in');
        this.rtcPeerConnection = new RTCPeerConnection(this.iceServers);
        this.rtcPeerConnection.onicecandidate = event => onIceCandidate(event);
        this.rtcPeerConnection.ontrack = event => onAddStream(event);
        this.rtcPeerConnection.addTrack(this.localStream.getTracks()[0], this.localStream);
        this.rtcPeerConnection.addTrack(this.localStream.getTracks()[1], this.localStream);
        this.rtcPeerConnection.createOffer()
          .then(sessionDescription => {
            console.log('sending offer', sessionDescription);
            this.rtcPeerConnection.setLocalDescription(sessionDescription);
            this.socket.emit('offer', {
              type: 'offer',
              sdp: sessionDescription,
              room: this.roomNumber
            });
          })
          .catch(err => {
            console.log(err);
          });
      }
    });

    this.socket.on('offer', (event) => {
      console.log('offer out', !this.isCaller);
      if (!this.isCaller == false) {
        console.log('offer in');
        this.rtcPeerConnection = new RTCPeerConnection(this.iceServers);
        this.rtcPeerConnection.onicecandidate = event => onIceCandidate(event);
        this.rtcPeerConnection.ontrack = event => onAddStream(event);
        this.rtcPeerConnection.addTrack(this.localStream.getTracks()[0], this.localStream);
        this.rtcPeerConnection.addTrack(this.localStream.getTracks()[1], this.localStream);
        console.log('recieved offer', event);
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
        this.rtcPeerConnection.createAnswer()
          .then(sessionDescription => {
            console.log('sending answer', sessionDescription);
            this.rtcPeerConnection.setLocalDescription(sessionDescription);
            this.socket.emit('answer', {
              type: 'answer',
              sdp: sessionDescription,
              room: this.roomNumber
            });
            console.log('answer');
          })
          .catch(err => {
            console.log(err);
          });
      }
    })

    this.socket.on('answer', (event) => {
      console.log('recieved answer', event);
      this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
    });

    this.socket.on('candidate', event => {
      const candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        sdpMid: event.id,
        candidate: event.candidate
      });
      console.log('recieved candidate', candidate)
      this.rtcPeerConnection.addIceCandidate(candidate);
    });

    const onAddStream = (event) => {
      this.remoteVideo.nativeElement.srcObject = event.streams[0];
      this.remoteStream = event.streams[0];
    }
  

    const onIceCandidate = (event) => {
      if (event.candidate) {
        console.log('sending ice candidate', event.candidate);
        this.socket.emit('candidate', {
          type: 'candidate',
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate,
          room: this.roomNumber,
        });
      }
    }
  }

  ngOnInit() {
  }

}
