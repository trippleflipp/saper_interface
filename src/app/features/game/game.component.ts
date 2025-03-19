import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Board } from './board';
import { Cell } from './cell';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { TimerComponent } from "./timer/timer.component";

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    TimerComponent
],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements AfterViewInit {
  @ViewChild(TimerComponent) timer: TimerComponent | undefined;
  firstClicked = false;
  board: Board;
  gameTime: number = 0;

  constructor() {
    this.board = new Board(20, 30);
  }

  ngAfterViewInit(): void {
      if (!this.timer) {
          console.error("TimerComponent is not available in GameComponent");
      }
  }

  checkCell(cell: Cell): void {
    if (!this.firstClicked) {
      this.startTimer();
      this.firstClicked = true;
    }
    const result = this.board.checkCell(cell);
    if (result === 'gameover') {
      this.stopTimer();
      this.firstClicked = false;
      alert(`You lose! Time: ${this.formatTime(this.gameTime)}`);
    }
    else if (result === 'win') {
      this.stopTimer();
      this.firstClicked = false;
      alert(`You win! Time: ${this.formatTime(this.gameTime)}`);
    }
  }

  flag(cell: Cell): void {
    if (cell.status !== 'clear') {
      if (cell.status === 'flag') {
        cell.status = 'open';
      }
      else {
        cell.status = 'flag';
      }
    }
  }

  reset(): void {
    this.board = new Board(20, 30);
    this.resetTimer();
    this.firstClicked = false;
  }

  startTimer(): void {
    this.timer?.start();
  }

  stopTimer(): void {
    this.timer?.stop();
  }

  resetTimer(): void {
    this.timer?.timerReset();
  }

  getProximityClass(cell: Cell): string {
    return `proximity-${cell.proximityMines}`;
  }

  onTimerStopped(timeInSeconds: number): void {
    this.gameTime = timeInSeconds;
  }

  formatTime(totalSeconds: number): string {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}