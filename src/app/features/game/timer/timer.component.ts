import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent implements OnDestroy {
  mm = 0;
  ss = 0;
  ms = 0;
  isRunning = false;
  private timerSubscription: Subscription | undefined;

  @Output() timerStopped: EventEmitter<number> = new EventEmitter<number>();

  start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      const startTime = Date.now() - (this.mm * 60000 + this.ss * 1000 + this.ms * 10);

      this.timerSubscription = interval(10)
        .pipe(
          map(() => {
            const now = Date.now();
            const diff = now - startTime;

            this.mm = Math.floor(diff / 60000);
            this.ss = Math.floor((diff % 60000) / 1000);
            this.ms = Math.floor((diff % 1000) / 10);

            return { mm: this.mm, ss: this.ss, ms: this.ms };
          })
        )
        .subscribe();
    }
  }


  stop(): void {
    if (this.isRunning) {
      this.isRunning = false;
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }
      this.timerStopped.emit((this.mm * 60 + this.ss) * 1000 + this.ms);
    }
  }

  timerReset(): void {
    this.stop();
    this.mm = 0;
    this.ss = 0;
    this.ms = 0;
  }

  format(num: number): string {
    return (num + '').padStart(2, '0');
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}