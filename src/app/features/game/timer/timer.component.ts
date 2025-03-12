import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-timer',
  imports: [],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent {
  mm = 0;
  ss = 0;
  ms = 0;
  isRunning = false;
  timerId = 0;

  @Input() timerReset(): void {
    clearInterval(this.timerId);
    this.isRunning = false;
    this.mm = 0;
    this.ss = 0;
    this.ms = 0;
  }

  @Input() startStop() {
    if (!this.isRunning) {
      this.timerId = setInterval(() => {
        this.ms++;

        if (this.ms >= 100) {
          this.ss++;
          this.ms = 0;
        }
        if (this.ss >= 60) {
          this.mm++;
          this.ss = 0
        }
      }, 10);
    } else {
      clearInterval(this.timerId);
    }
    this.isRunning = !this.isRunning;
  }

  format(num: number) {
    return (num + '').length === 1 ? '0' + num : num + '';
  }

  
}
