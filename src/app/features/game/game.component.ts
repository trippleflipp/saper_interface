import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Board } from './board';
import { Cell } from './cell';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { TimerComponent } from "./timer/timer.component";
import { ConfettiComponent } from '../confetti/confetti.component';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarData } from '../../interfaces/snackbardata.model';
import { GameStatus, GameDifficulty } from '../../interfaces/game-status.enum';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    TimerComponent,
    ConfettiComponent,
    MatSnackBarModule
],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  @ViewChild(ConfettiComponent) confettiComponent: ConfettiComponent;
  @ViewChild(TimerComponent) timer: TimerComponent;
  
  firstClicked = false;
  gameStatus: GameStatus = GameStatus.init;
  board: Board;
  gameTime: number = 0;
  currentDifficulty: GameDifficulty = GameDifficulty.medium;
  GameDifficulty = GameDifficulty;
  remainingFlags: number;
  isGameOver = false;
  
  private readonly difficultySettings = {
    [GameDifficulty.easy]: { size: 9, mines: 8 },
    [GameDifficulty.medium]: { size: 12, mines: 20 },
    [GameDifficulty.hard]: { size: 16, mines: 40 }
  };

  constructor(
    private snackBar: MatSnackBar
  ) {
    this.initializeBoard();
  }

  private initializeBoard(): void {
    const settings = this.difficultySettings[this.currentDifficulty];
    this.board = new Board(settings.size, settings.mines);
    this.remainingFlags = settings.mines;
  }

  setDifficulty(difficulty: GameDifficulty): void {
    this.currentDifficulty = difficulty;
    this.reset();
  }

  checkCell(cell: Cell): void {
    if (this.gameStatus === GameStatus.ended) return;
    this.startGame(cell);
    const result = this.board.checkCell(cell);
    this.winOrGameover(result);
  }

  startGame(cell: Cell): void {
    if (this.gameStatus === GameStatus.init) {
      this.gameStatus = GameStatus.started
      this.board.generateBoard(cell.row, cell.column);
      this.timer.start();
    }
  }

  winOrGameover(result: "gameover" | "win" | undefined) {
    if (result === 'gameover') {
      this.gameStatus = GameStatus.ended;
      this.isGameOver = true;
      this.timer.stop();
      this.openSnackbar("На одного сталкера в Зоне стало меньше...", `Время: ${this.formatTime(this.gameTime)}`, 4000);
    }
    else if (result === 'win') {
      this.gameStatus = GameStatus.ended;
      this.isGameOver = false;
      this.timer.stop();
      this.confettiComponent.launchConfetti();
      this.openSnackbar("Победа! Вы нашли артефакт!", `Время: ${this.formatTime(this.gameTime)}`, 4000);
    }
  }

  flag(cell: Cell): void {
    if (this.gameStatus === GameStatus.started) {
      if (cell.status !== 'clear') {
        const newStatus = cell.status === 'flag' ? 'open' : 'flag';
        if (newStatus === 'flag' && this.remainingFlags === 0) {
          return; // Нельзя поставить флажок, если их не осталось
        }
        cell.status = newStatus;
        this.remainingFlags += cell.status === 'flag' ? -1 : 1;
      }
    }
  }

  reset(): void {
    this.gameStatus = GameStatus.init;
    this.isGameOver = false;
    this.initializeBoard();
    this.timer.timerReset();
    this.firstClicked = false;
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

  openSnackbar(title: string, message: string, duration: number): void {
    const data: SnackbarData = {
      title: title,
      message: message,
      duration: duration,
      button: null
    }
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: data,
      duration: undefined
    });
  }
}