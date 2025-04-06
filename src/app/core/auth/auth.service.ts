import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../features/snackbar/snackbar.component';
import { SnackbarData } from '../../interfaces/snackbardata.model';

interface LoginResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://127.0.0.1:5000';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private userRoleSubject = new BehaviorSubject<string | null>(this.getRoleFromToken());
  public userRole$ = this.userRoleSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.access_token);
      }),
      catchError(this.handleError)
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData).pipe(
      catchError(this.handleError)
    );
  }

  confrimEmail(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify_email`, data).pipe(
      catchError(this.handleError)
    )
  }

  requestPasswordReset(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/request_password_reset`, data).pipe(
      catchError(this.handleError)
    )
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset_password`, data).pipe(
      catchError(this.handleError)
    )
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
    this.userRoleSubject.next(null);
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
}