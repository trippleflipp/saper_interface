import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Board } from './board';
import { Cell } from './cell';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { TimerComponent } from "./timer/timer.component";
import { ConfettiComponent } from '../confetti/confetti.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    TimerComponent,
    ConfettiComponent
],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements AfterViewInit {
  @ViewChild(ConfettiComponent) confettiComponent: ConfettiComponent | undefined;
  @ViewChild(TimerComponent) timer: TimerComponent | undefined;
  
  firstClicked = false;
  board: Board;
  gameTime: number = 0;
  boardSize: number = 20;
  mineCount: number = 30;

  constructor() {
    this.board = new Board(this.boardSize, this.mineCount);
  }

  ngAfterViewInit(): void {
      if (!this.timer) {
          console.error("TimerComponent is not available in GameComponent");
      }
  }

  checkCell(cell: Cell): void {
    if (!this.firstClicked) {
      this.board.generateBoard(cell.row, cell.column);
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
      this.launchConfetti();
    }
  }

  flag(cell: Cell): void {
    if (this.firstClicked) {
      if (cell.status !== 'clear') {
        cell.status = cell.status === 'flag' ? 'open' : 'flag';
      }
    }
  }

  reset(): void {
    this.board = new Board(this.boardSize, this.mineCount);
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

  formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  launchConfetti() {
    this.confettiComponent?.launchConfetti();
  }
}