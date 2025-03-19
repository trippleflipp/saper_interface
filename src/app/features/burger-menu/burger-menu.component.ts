import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-burger-menu',
  imports: [],
  templateUrl: './burger-menu.component.html',
  styleUrl: './burger-menu.component.scss'
})
export class BurgerMenuComponent {
  isOpen: boolean = false;
  close = new EventEmitter<void>();

  toggleMenu() {
    this.isOpen = !this.isOpen
  }

  closeMenu() {
    this.isOpen = false;
  }

  constructor(private eRef: ElementRef) {}
}
