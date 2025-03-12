import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-svo',
  imports: [
    NgIf
  ],
  templateUrl: './svo.component.html',
  styleUrl: './svo.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SvoComponent implements OnInit {
  imageUrl: string = 'https://mu-kgt.ru/informing/wap/marsh/widget/contract/images/1100000.jpg';
  isPopupVisible: boolean = false;

  ngOnInit(): void {
    this.showPopup(this.imageUrl);
  }

  showPopup(imageUrl: string): void {
    this.imageUrl = imageUrl;
    this.isPopupVisible = true;
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }
}