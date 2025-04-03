import { Injectable } from "@angular/core";
import { BaseApiService } from "./base-api.service";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private apiUrl = 'http://127.0.0.1:5000';

    constructor(
        private baseApiService: BaseApiService,
        private http: HttpClient
    ) {}

    new_record(data: unknown) {
        this.baseApiService.post("/new_record", data).subscribe((res) => {
            return res
        })
    }

    get_records(): Observable<any> {
        return this.http.get(`${this.apiUrl}/get_records`);
      }
}