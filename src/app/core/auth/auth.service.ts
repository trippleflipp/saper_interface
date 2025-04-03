import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../features/snackbar/snackbar.component';
import { SnackbarData } from '../../interfaces/snackbardata.model';
import { User } from '../../interfaces/user.interface';

interface LoginResponse {
  access_token: string;
  user: User;
}

interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  access_token: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly INITIAL_COINS = 100;
  private baseUrl = 'http://127.0.0.1:5000';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private userRoleSubject = new BehaviorSubject<string | null>(this.getRoleFromToken());
  public userRole$ = this.userRoleSubject.asObservable();
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  private getCurrentUserFromStorage(): User | null {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      // Ensure coins are set for existing users
      if (!user.isGuest && user.coins === undefined) {
        user.coins = this.INITIAL_COINS;
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      return user;
    }
    return null;
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.access_token);
        if (response.user && !response.user.isGuest) {
          // Initialize coins for logged in user if not set
          if (response.user.coins === undefined) {
            response.user.coins = this.INITIAL_COINS;
          }
          this.currentUserSubject.next(response.user);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: any): Observable<RegisterResponse> {
    // Add initial coins to new user data
    const userDataWithCoins = {
      ...userData,
      coins: this.INITIAL_COINS
    };
    
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, userDataWithCoins).pipe(
      tap(response => {
        // After successful registration, store user data with coins
        const user: User = {
          id: response.id,
          email: response.email,
          name: response.username,
          coins: this.INITIAL_COINS,
          isGuest: false
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.setToken(response.access_token); // Assuming the response includes a token
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.isLoggedInSubject.next(false);
    this.userRoleSubject.next(null);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.isLoggedInSubject.next(true);
    this.userRoleSubject.next(this.getRoleFromToken());
  }

  hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  getRoleFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || null;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  getProtectedData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/protected`).pipe(
      catchError(this.handleError)
    );
  }

  navigate(): void {
    const role = this.getRoleFromToken();
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'player') {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = "Неизвестная ошибка!";
    switch (true) {
      case error.error.message === "Username already exists":
        errorMessage = "Пользователь с таким именем уже есть!";
        break;
      case error.status === 401:
        errorMessage = "Проверьте вводимые данные";
        break;
      default:
        break;
    }
    this.openSnackBar("Ошибка!", errorMessage, 4000);
    return throwError(() => error);
  }

  openSnackBar(title: string, message: string, duration: number): void {
      const data: SnackbarData = {
        title: title,
        message: message,
        duration: duration,
        button: null
      }
      this.snackBar.openFromComponent(SnackbarComponent, {
        data: data,
        duration: undefined
      });
    }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateUserCoins(coins: number): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      currentUser.coins = coins;
      this.currentUserSubject.next(currentUser);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Here you would typically also update the coins on the backend
      // this.http.post(`${this.baseUrl}/update-coins`, { coins }).subscribe();
    }
  }
}