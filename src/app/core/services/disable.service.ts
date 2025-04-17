import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DisableService {
    private functionCallSource = new Subject<void>();
    functionCall$ = this.functionCallSource.asObservable();

    callFunction() {
        this.functionCallSource.next();
    }
}