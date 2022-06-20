import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  @ViewChild('check') check: ElementRef
  constructor(private rendere: Renderer2) { }

  button() {
    let apandedDiv = document.createElement('div');
    this.rendere.addClass(this.check.nativeElement, 'appand');

    let markup = "<h1>hello i am check</h1>"
    apandedDiv.innerHTML = markup

    this.check.nativeElement.appendChild(apandedDiv);
  }

  ngOnInit(): void {
  }

}
