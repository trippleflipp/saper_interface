import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BaseApiService } from '../core/services/base-api.service';
import { tap } from 'rxjs/operators';

export interface BackgroundTheme {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  owned: boolean;
}

const MOCK_BACKGROUNDS: BackgroundTheme[] = [
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

  getAvailableBackgrounds(): Observable<BackgroundTheme[]> {
    const ownedBackgrounds = JSON.parse(localStorage.getItem('owned_backgrounds') || '[]');
    const backgrounds = MOCK_BACKGROUNDS.map(bg => ({
      ...bg,
      owned: ownedBackgrounds.includes(bg.id)
    }));
    return of(backgrounds);
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