import { Injectable } from "@angular/core";
import { BaseApiService } from "./base-api.service";
import { Observable, BehaviorSubject } from "rxjs";
import { SnackbarData } from "../../interfaces/snackbardata.model";
import { SnackbarComponent } from "../../features/snackbar/snackbar.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CoinsService } from "./coins.service";

@Injectable({
    providedIn: 'root'
})
export class GameService {
    private coinsSubject = new BehaviorSubject<number>(0);
    coins$ = this.coinsSubject.asObservable();

    constructor(
        private baseApiService: BaseApiService,
        private snackBar: MatSnackBar,
        private coinsService: CoinsService,
    ) {}

    new_record(data: unknown) {
        this.baseApiService.post("/new_record", data).subscribe((res: any) => {
            if (res.message == "New record submitted and is in the top 10!") {
                setTimeout(() => {
                    this.openSnackbar("Поздравляем!", "Вы попали в топ-10 игроков!", 3000);
                }, 2000);
            }
            this.updateCoins();
            return res
        })
    }

    get_records(): Observable<any> {
        return this.baseApiService.get('/get_records');
    }

    get_personal_records(): Observable<any> {
        return this.baseApiService.get('/get_personal_records');
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