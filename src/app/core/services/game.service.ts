import { Injectable } from "@angular/core";
import { BaseApiService } from "./base-api.service";
import { Observable, BehaviorSubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { SnackbarData } from "../../interfaces/snackbardata.model";
import { SnackbarComponent } from "../../features/snackbar/snackbar.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CoinsService } from "./coins.service";

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private apiUrl = 'http://127.0.0.1:5000';
    private coinsSubject = new BehaviorSubject<number>(0);
    coins$ = this.coinsSubject.asObservable();

    constructor(
        private baseApiService: BaseApiService,
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private coinsService: CoinsService,
    ) {}

    new_record(data: unknown) {
        this.baseApiService.post("/new_record", data).subscribe((res: any) => {
            if (res.message == "New record submitted and is in the top 10!") {
                this.openSnackbar("Поздравляем!", "Вы нашли артефакт и попали в топ-10 игроков!", 3000);
            }
            else if (res.message == "New record submitted, but it is not in the top 10.") {
                this.openSnackbar("Победа!", "Вы нашли артефакт.", 3000);
            }
            this.updateCoins();
            return res
        })
    }

    get_records(): Observable<any> {
        return this.http.get(`${this.apiUrl}/get_records`);
    }

    updateCoins() {
        this.coinsService.get_coins().subscribe((res: any) => {
            this.coinsSubject.next(res.coins);
        });
    }

    private openSnackbar(title: string, message: string, duration: number): void {
        const data: SnackbarData = {
          title,
          message,
          duration,
          button: null
        };
        this.snackBar.openFromComponent(SnackbarComponent, {
          data,
          duration: undefined
        });
      }
}