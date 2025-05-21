import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from "../../features/header/header.component";
import { GameBackgroundComponent } from '../../features/background/background.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BackgroundService, BackgroundTheme, MOCK_BACKGROUNDS } from '../../services/background.service';
import { Subscription } from 'rxjs';
import { GameService } from '../../core/services/game.service';

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
export class ShopComponent implements OnInit, OnDestroy {
  @ViewChild(GameBackgroundComponent) backgroundComponent: GameBackgroundComponent;
  backgrounds: BackgroundTheme[] = [];
  currentIndex = 0;
  direction: 'left' | 'right' | null = null;
  currentCoins: number;
  coinsSubscription = new Subscription;

  constructor(
    private backgroundService: BackgroundService,
    private gameService: GameService,
  ) {}

  ngOnInit() {
    this.loadBackgrounds();
    this.coinsSubscription = this.gameService.coins$.subscribe(coins => {
      this.currentCoins = coins;
    });
    this.gameService.updateCoins();
  }

  ngOnDestroy(): void {
    this.coinsSubscription.unsubscribe();
  }

  private loadBackgrounds() {
    this.backgroundService.getAvailableBackgrounds().subscribe(
      (response: AvailableBackgroundsResponse) => {
        console.log('Ответ от сервера:', response);
        // Преобразуем строку в массив ID
        const ownedIds = response.available_bg ? 
          response.available_bg.split(',').filter((id: string) => id !== '') : [];
        console.log('Массив ID купленных фонов:', ownedIds);
        const currentBackground = this.backgroundService.getSelectedBackground();
        this.backgrounds = MOCK_BACKGROUNDS.map((bg: BackgroundTheme) => {
          const isOwned = ownedIds.includes(bg.id.toString());
          const isSelected = bg.imageUrl === currentBackground;
          console.log(`Фон ${bg.id} (${bg.name}): owned = ${isOwned}, selected = ${isSelected}`);
          return {
            ...bg,
            owned: isOwned,
            selected: isSelected
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
          this.gameService.updateCoins();
        },
        (error) => {
          console.error('Ошибка при покупке фона:', error);
        }
      );
    }
  }

  selectBackground(background: BackgroundTheme) {
    this.backgroundService.setSelectedBackground(background.imageUrl);
    // Обновляем состояние выбранного фона для всех фонов
    this.backgrounds.forEach(bg => {
      bg.selected = bg.imageUrl === background.imageUrl;
    });
    if (this.backgroundComponent) {
      this.backgroundComponent.setBackground();
    }
  }
} 