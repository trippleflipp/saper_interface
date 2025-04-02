import { Component, EventEmitter, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RulesDialogComponent } from '../rules-dialog/rules-dialog.component';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { SoundService } from '../../services/sound_service';

@Component({
  selector: 'app-burger-menu',
  standalone: true,
  imports: [
    MatIconModule
  ],
  templateUrl: './burger-menu.component.html',
  styleUrl: './burger-menu.component.scss'
})
export class BurgerMenuComponent {
  isOpen: boolean = false;
  isMusicEnabled = false;
  isSoundEnabled = false;
  close = new EventEmitter<void>();

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private soundService: SoundService
  ) {
    this.soundService.isMusicEnabled$.subscribe((enabled: boolean) => {
      this.isMusicEnabled = enabled;
    });
    this.soundService.isSoundEnabled$.subscribe((enabled: boolean) => {
      this.isSoundEnabled = enabled;
    });
  }

  toggleMenu() {
    this.isOpen = !this.isOpen
  }

  closeMenu() {
    this.isOpen = false;
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

  toggleMusic(): void {
    this.soundService.toggleMusic();
  }

  toggleSound(): void {
    this.soundService.toggleSound();
  }

  logout () {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
