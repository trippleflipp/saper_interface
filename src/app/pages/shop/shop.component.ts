import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from "../../features/header/header.component";
import { GameBackgroundComponent } from '../../features/background/background.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BackgroundService, BackgroundTheme, MOCK_BACKGROUNDS } from '../../services/background.service';

interface AvailableBackgroundsResponse {
  available_bg: string;
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    HeaderComponent,
    GameBackgroundComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NgFor,
    NgIf
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  @ViewChild(GameBackgroundComponent) backgroundComponent: GameBackgroundComponent;
  backgrounds: BackgroundTheme[] = [];
  currentIndex = 0;
  direction: 'left' | 'right' | null = null;

  constructor(private backgroundService: BackgroundService) {}

  ngOnInit() {
    this.loadBackgrounds();
  }

  private loadBackgrounds() {
    this.backgroundService.getAvailableBackgrounds().subscribe(
      (response: AvailableBackgroundsResponse) => {
        console.log('Ответ от сервера:', response);
        // Преобразуем строку в массив ID
        const ownedIds = response.available_bg ? 
          response.available_bg.split(',').filter((id: string) => id !== '') : [];
        console.log('Массив ID купленных фонов:', ownedIds);
        this.backgrounds = MOCK_BACKGROUNDS.map((bg: BackgroundTheme) => {
          const isOwned = ownedIds.includes(bg.id.toString());
          console.log(`Фон ${bg.id} (${bg.name}): owned = ${isOwned}`);
          return {
            ...bg,
            owned: isOwned
          };
        });
        console.log('Итоговый массив фонов:', this.backgrounds);
      },
      (error) => {
        console.error('Ошибка при загрузке фонов:', error);
      }
    );
  }

  get visibleBackgrounds(): BackgroundTheme[] {
    if (this.backgrounds.length === 0) {
      return [];
    }
    const result = [];
    for (let i = -1; i <= 1; i++) {
      const index = this.normalizeIndex(this.currentIndex + i);
      result.push(this.backgrounds[index]);
    }
    return result;
  }

  private normalizeIndex(index: number): number {
    const length = this.backgrounds.length;
    return ((index % length) + length) % length;
  }

  previousBackground() {
    this.direction = 'left';
    this.currentIndex = this.normalizeIndex(this.currentIndex - 1);
    setTimeout(() => this.direction = null, 500);
  }

  nextBackground() {
    this.direction = 'right';
    this.currentIndex = this.normalizeIndex(this.currentIndex + 1);
    setTimeout(() => this.direction = null, 500);
  }

  purchaseBackground(background: BackgroundTheme) {
    if (background.owned) {
      this.selectBackground(background);
    } else {
      this.backgroundService.purchaseBackground(background).subscribe(
        (response) => {
          background.owned = true;
          this.selectBackground(background);
          
        },
        (error) => {
          console.error('Ошибка при покупке фона:', error);
        }
      );
    }
  }

  selectBackground(background: BackgroundTheme) {
    this.backgroundService.setSelectedBackground(background.imageUrl);
    if (this.backgroundComponent) {
      this.backgroundComponent.setBackground();
    }
  }
} 