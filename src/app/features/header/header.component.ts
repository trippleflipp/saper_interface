import { Component, ElementRef, HostListener, Input, Output, ViewChild, } from '@angular/core';
import { BurgerMenuComponent } from '../burger-menu/burger-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    BurgerMenuComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @ViewChild(BurgerMenuComponent) burgerMenu: BurgerMenuComponent
  isRotated: boolean = false;
  rotationDirection: number = -1;

  rotateSvg() {
    this.isRotated = !this.isRotated;
    if (this.isRotated) {
      setTimeout(() => {
        this.isRotated = false;
      }, 200);
    }
    this.rotationDirection *= -1;
  }

  getRotationDirection(): number {
    return this.rotationDirection;
  }
}