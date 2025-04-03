import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CoinsService {
  private readonly INITIAL_COINS = 100;
  private coinsSubject = new BehaviorSubject<number>(0);
  coins$ = this.coinsSubject.asObservable();

  constructor(private authService: AuthService) {
    this.initializeCoins();
    
    // Subscribe to user changes to update coins
    this.authService.currentUser$.subscribe(user => {
      if (user && !user.isGuest) {
        this.coinsSubject.next(user.coins);
      } else {
        this.coinsSubject.next(0);
      }
    });
  }

  private initializeCoins() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && !currentUser.isGuest) {
      this.coinsSubject.next(currentUser.coins);
    } else {
      this.coinsSubject.next(0);
    }
  }

  getCurrentCoins(): number {
    return this.coinsSubject.value;
  }

  useCoins(amount: number): boolean {
    const currentCoins = this.getCurrentCoins();
    if (currentCoins >= amount) {
      const newAmount = currentCoins - amount;
      this.coinsSubject.next(newAmount);
      this.authService.updateUserCoins(newAmount);
      return true;
    }
    return false;
  }

  addCoins(amount: number): void {
    const currentCoins = this.getCurrentCoins();
    const newAmount = currentCoins + amount;
    this.coinsSubject.next(newAmount);
    this.authService.updateUserCoins(newAmount);
  }
} 