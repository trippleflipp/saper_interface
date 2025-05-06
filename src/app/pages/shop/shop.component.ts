import { Component } from '@angular/core';
import { HeaderComponent } from "../../features/header/header.component";
import { GameBackgroundComponent } from '../../features/background/background.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface BackgroundTheme {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  owned: boolean;
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
    NgFor
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {
  backgrounds: BackgroundTheme[] = [
    {
      id: 1,
      name: 'Тёмный лес',
      price: 1000,
      imageUrl: 'assets/images/shop/background1.jpg',
      owned: false
    },
    {
      id: 2,
      name: 'Заброшенный бункер',
      price: 1500,
      imageUrl: 'assets/images/shop/background2.jpg',
      owned: false
    },
    {
      id: 3,
      name: 'Заброшенная деревня',
      price: 2000,
      imageUrl: 'assets/images/shop/background3.jpg',
      owned: false
    },
    {
      id: 4,
      name: 'Болото',
      price: 2500,
      imageUrl: 'assets/images/shop/background4.jpg',
      owned: false
    }
  ];

  currentIndex = 0;
  direction: 'left' | 'right' | null = null;

  get visibleBackgrounds(): BackgroundTheme[] {
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
    // TODO: Implement purchase logic
    console.log(`Purchasing background: ${background.name}`);
  }
} 