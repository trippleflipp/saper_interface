import { Component, ElementRef, HostListener, ViewChild, } from '@angular/core';
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

  constructor(
    private el: ElementRef
  ) {}

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

  @HostListener('document:mousedown', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target) && this.burgerMenu.isOpen) {
      this.burgerMenu.closeMenu();
      this.rotateSvg();
    }
  }
}