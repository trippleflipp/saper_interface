import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../features/snackbar/snackbar.component';
import { SnackbarData } from '../../interfaces/snackbardata.model';
import { BaseApiService } from '../services/base-api.service';

interface LoginResponse {
  access_token: string;
  requires_2fa?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private userRoleSubject = new BehaviorSubject<string | null>(this.getRoleFromToken());
  public userRole$ = this.userRoleSubject.asObservable();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private baseApiService: BaseApiService
  ) { }

  login(credentials: any): Observable<LoginResponse> {
    return this.baseApiService.post<LoginResponse>('login', credentials).pipe(
      tap(response => {
          if (!response.requires_2fa) {
            this.setToken(response.access_token);
          }
      }),
      catchError(this.handleError)
    );
}

  register(userData: any): Observable<any> {
    return this.baseApiService.post('/register', userData).pipe(
      catchError(this.handleError)
    );
  }

  confrimEmail(data: any): Observable<any> {
    return this.baseApiService.post('/verify_email', data).pipe(
      catchError(this.handleError)
    )
  }

  requestPasswordReset(data: any): Observable<any> {
    return this.baseApiService.post('/request_password_reset', data).pipe(
      catchError(this.handleError)
    )
  }

  resetPassword(data: any): Observable<any> {
    return this.baseApiService.post('/reset_password', data).pipe(
      catchError(this.handleError)
    )
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    this.userRoleSubject.next(null);
    this.router.navigate(['/login']);
  }

  generateQr(): Observable<Blob> {
    return this.baseApiService.get('generate_qr', { responseType: 'blob' as 'json' });
}

  verify2fa(data: any): Observable<any> {
    return this.baseApiService.post('/verify_2fa', data).pipe(
      catchError(this.handleError)
    )
  }

  enable2fa(): Observable<any> {
    return this.baseApiService.get('/generate_qr').pipe(
      catchError(this.handleError)
    )
  }

  check2faStatus(): Observable<any> {
    return this.baseApiService.get('/status_2fa').pipe(
      catchError(this.handleError)
    );
  }

  disable2fa(): Observable<any> {
    return this.baseApiService.get('/disable_2fa').pipe(
      catchError(this.handleError)
    )
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

  getUsernameFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.username || null;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
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

  verify2faLogin(data: any): Observable<LoginResponse> {
    return this.baseApiService.post<LoginResponse>('/verify_2fa_login', data).pipe(
      tap(response => {
        this.setToken(response.access_token);
      }),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = "Неизвестная ошибка!";
    switch (true) {
      case error.error.message === "Username already exists":
        errorMessage = "Пользователь с таким email уже существует!";
        break;
      case error.status === 401:
        errorMessage = "Проверьте вводимые данные";
        break;
      case error.error.message === "Invalid Code":
        errorMessage = "Неверный код подтверждения";
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
}