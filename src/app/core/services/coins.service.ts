import { Injectable } from "@angular/core";
import { BaseApiService } from "./base-api.service";

@Injectable({
    providedIn: 'root'
})
export class CoinsService {
    constructor(
            private baseApiService: BaseApiService
    ) {}

    get_coins() {
        return this.baseApiService.get("/get_coins");
    }

    open_mine() {
        return this.baseApiService.get("/open_mine")
    }
}