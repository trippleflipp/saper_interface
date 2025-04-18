import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class BaseApiService {
    private apiUrl = 'https://saper-backend.onrender.com';

    constructor(
        private http: HttpClient
    ) { }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders(
            {   
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'rejectUnauthorized': 'false'
            }
        );
    }

    get<T>(endpoint: string, options?: object): Observable<T> {
        return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { headers: this.getHeaders(), ...options });
    }

    post<T>(endpoint: string, data: unknown, options?: object): Observable<T> {
        return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data, { headers: this.getHeaders(), ...options });
    }

    delete<T>(endpoint: string, id: number): Observable<T> {
        return this.http.delete<T>(`${this.apiUrl}/${endpoint}/${id}`, { headers: this.getHeaders() });
    }
}