import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RulesDialogComponent } from '../rules-dialog/rules-dialog.component';

@Component({
  selector: 'app-burger-menu',
  standalone: true,
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

  openRules() {
    this.dialog.open(RulesDialogComponent, {
      width: '50vw',
      height: '80vh',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
    this.closeMenu();
  }

  constructor(
    private eRef: ElementRef,
    private dialog: MatDialog
  ) {}
}
