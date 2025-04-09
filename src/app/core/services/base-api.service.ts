import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BaseApiService {
    private apiUrl = 'http://apisaper.hopto.org';

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

    get<T>(endpoint: string): Observable<T> {
        return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { headers: this.getHeaders() });
    }

    post<T>(endpoint: string, data: unknown): Observable<T> {
        return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data, { headers: this.getHeaders() });
    }

    delete<T>(endpoint: string, id: number): Observable<T> {
        return this.http.delete<T>(`${this.apiUrl}/${endpoint}/${id}`, { headers: this.getHeaders() });
    }
}