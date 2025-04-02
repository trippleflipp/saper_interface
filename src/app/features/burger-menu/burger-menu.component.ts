import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RulesDialogComponent } from '../rules-dialog/rules-dialog.component';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { SoundComponent } from "../sound/sound.component";

@Component({
  selector: 'app-burger-menu',
  standalone: true,
  imports: [
    MatIconModule,
    SoundComponent
],
  templateUrl: './burger-menu.component.html',
  styleUrl: './burger-menu.component.scss'
})
export class BurgerMenuComponent {
  isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
  ) {}

  toggleMenu() {
    this.isOpen = !this.isOpen
  }

  closeMenu() {
    this.isOpen = false;
    this.close.emit();
  }

  openLeaderTable() {
    this.router.navigate(['/leader_table']);
  }

  openGame() {
    this.router.navigate(['/home']);
  }

  openRules() {
    this.dialog.open(RulesDialogComponent, {
      width: '50vw',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  logout () {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
