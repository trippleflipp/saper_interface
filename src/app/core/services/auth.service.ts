import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Initialize from localStorage if available
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(user: User) {
    // Set initial coins for new registered users
    if (!user.isGuest && user.coins === undefined) {
      user.coins = 100;
    }
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  updateUserCoins(coins: number) {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      currentUser.coins = coins;
      this.currentUserSubject.next(currentUser);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }
} 