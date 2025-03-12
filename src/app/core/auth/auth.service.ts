import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

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

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
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
      }
    }
    return null;
  }

  getProtectedData(): Observable<any> {
      return this.http.get(`${this.baseUrl}/protected`);
  }

  navigate(): void {
    const role = this.getRoleFromToken();
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'player') {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/login']);
      console.error('Unknown role, navigating to /login');
    }
  }
}