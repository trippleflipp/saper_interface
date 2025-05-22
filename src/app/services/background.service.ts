import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';
import { tap, map } from 'rxjs/operators';

export interface BackgroundTheme {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  owned: boolean;
  selected?: boolean;
}

interface AvailableBackgroundsResponse {
  available_bg: string;
}

export const MOCK_BACKGROUNDS: BackgroundTheme[] = [
  {
    id: 0,
    name: 'По умолчанию',
    price: 0,
    imageUrl: 'assets/images/shop/default.jpg',
    owned: true
  },
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
  },
  {
    id: 5,
    name: 'Заброшенный вертолет',
    price: 3000,
    imageUrl: 'assets/images/shop/background5.png',
    owned: false
  },
  {
    id: 6,
    name: 'Руины',
    price: 3000,
    imageUrl: 'assets/images/shop/background6.png',
    owned: false
  },
  {
    id: 7,
    name: 'КПП',
    price: 3000,
    imageUrl: 'assets/images/shop/background7.png',
    owned: false
  },
  {
    id: 8,
    name: 'Колесо обозрения',
    price: 3000,
    imageUrl: 'assets/images/shop/background8.png',
    owned: false
  },
  {
    id: 9,
    name: 'Рассвет',
    price: 3000,
    imageUrl: 'assets/images/shop/background9.png',
    owned: false
  },
  {
    id: 10,
    name: 'Тёмный лес',
    price: 3000,
    imageUrl: 'assets/images/shop/background10.png',
    owned: false
  },
  {
    id: 11,
    name: 'Фабрика',
    price: 3000,
    imageUrl: 'assets/images/shop/background11.png',
    owned: false
  }
];

@Injectable({
  providedIn: 'root'
})
export class BackgroundService {
  private readonly STORAGE_KEY = 'selected_background';

  constructor(
    private http: HttpClient,
    private baseAPIService: BaseApiService
  ) {}

  getSelectedBackground(): string {
    return localStorage.getItem(this.STORAGE_KEY) || 'assets/images/game-bg.jpg';
  }

  setSelectedBackground(backgroundUrl: string): void {
    localStorage.setItem(this.STORAGE_KEY, backgroundUrl);
  }

  setDefaultBackground(): void {
    localStorage.setItem(this.STORAGE_KEY, 'assets/images/game-bg.jpg')
  }

  getAvailableBackgrounds(): Observable<AvailableBackgroundsResponse> {
    return this.baseAPIService.get<AvailableBackgroundsResponse>('/get_available_bg');
  }

  purchaseBackground(background: BackgroundTheme): Observable<any> {
    return this.baseAPIService.post('/add_bg', {
      id: background.id,
      price: background.price
    }).pipe(
      tap(() => {
        // После успешной покупки добавляем ID фона в список купленных
        const ownedBackgrounds = JSON.parse(localStorage.getItem('owned_backgrounds') || '[]');
        if (!ownedBackgrounds.includes(background.id)) {
          ownedBackgrounds.push(background.id);
          localStorage.setItem('owned_backgrounds', JSON.stringify(ownedBackgrounds));
        }
      })
    );
  }
} 