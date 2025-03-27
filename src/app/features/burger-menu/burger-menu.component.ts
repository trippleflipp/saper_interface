import { Component, EventEmitter } from '@angular/core';
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

  constructor(
    private dialog: MatDialog
  ) {}

  toggleMenu() {
    this.isOpen = !this.isOpen
  }

  closeMenu() {
    this.isOpen = false;
  }

  openRules() {
    this.dialog.open(RulesDialogComponent, {
      width: '50vw',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
    this.closeMenu();
  }
}
