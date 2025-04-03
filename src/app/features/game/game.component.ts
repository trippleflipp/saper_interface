import { Component, ViewChild, OnInit, OnDestroy, Input } from '@angular/core';
import { Board } from './board';
import { Cell } from './cell';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { TimerComponent } from "./timer/timer.component";
import { ConfettiComponent } from '../confetti/confetti.component';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarData } from '../../interfaces/snackbardata.model';
import { GameStatus, GameDifficulty } from '../../interfaces/game-status.enum';
import { SoundService } from '../../core/services/sound.service';
import { GameService } from '../../core/services/game.service';
import { CoinsService } from '../../core/services/coins.service';
import { Subscription } from 'rxjs';

interface DifficultySettings {
  size: number;
  mines: number;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    TimerComponent,
    ConfettiComponent,
    MatSnackBarModule,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild(ConfettiComponent) confettiComponent!: ConfettiComponent;
  @ViewChild(TimerComponent) timer!: TimerComponent;

  coinsSubscription = new Subscription
  
  firstClicked = false;
  gameStatus: GameStatus = GameStatus.init;
  board!: Board;
  gameTime = 0;
  currentDifficulty: GameDifficulty = GameDifficulty.medium;
  GameDifficulty = GameDifficulty;
  remainingFlags = 0;
  isGameOver = false;
  currentCoins: number;
  
  private readonly difficultySettings: Record<GameDifficulty, DifficultySettings> = {
    [GameDifficulty.easy]: { size: 9, mines: 8 },
    [GameDifficulty.medium]: { size: 12, mines: 20 },
    [GameDifficulty.hard]: { size: 16, mines: 40 }
  };

  constructor(
    private snackBar: MatSnackBar,
    private soundService: SoundService,
    private gameService: GameService,
    private coinsService: CoinsService
  ) {
    this.initializeBoard();
  }

  ngOnInit(): void {
    this.soundService.setGameActive(true);
    this.coinsSubscription = this.gameService.coins$.subscribe(coins => {
      this.currentCoins = coins;
    });
    this.gameService.updateCoins();
  }

  ngOnDestroy(): void {
    this.soundService.setGameActive(false);
    this.coinsSubscription.unsubscribe();
  }

  private initializeBoard(): void {
    const settings = this.difficultySettings[this.currentDifficulty];
    this.board = new Board(settings.size, settings.mines);
    this.remainingFlags = settings.mines;
  }

  setDifficulty(difficulty: GameDifficulty): void {
    this.currentDifficulty = difficulty;
    this.reset();
    this.soundService.checkGameInteraction();
  }

  checkCell(cell: Cell): void {
    if (this.gameStatus === GameStatus.ended) return;
    
    this.startGame(cell);
    const result = this.board.checkCell(cell);
    this.winOrGameover(result);
    this.soundService.checkGameInteraction();
  }

  startGame(cell: Cell): void {
    if (this.gameStatus === GameStatus.init) {
      this.gameStatus = GameStatus.started;
      this.board.generateBoard(cell.row, cell.column);
      this.timer.start();
      this.soundService.checkGameInteraction();
    }
  }

  private winOrGameover(result: "gameover" | "win" | undefined): void {
    if (result === 'gameover') {
      this.handleGameOver();
    } else if (result === 'win') {
      this.handleWin();
    }
  }

  private handleGameOver(): void {
    this.gameStatus = GameStatus.ended;
    this.isGameOver = true;
    this.timer.stop();
    this.gameService.updateCoins();
    
    this.openSnackbar(
      "На одного сталкера в Зоне стало меньше...", 
      `Время: ${this.formatTime(this.gameTime)}`, 
      3000
    );
    
    this.soundService.stopBackgroundMusic();
    this.soundService.playSound("fail-wha-wha");
    
    setTimeout(() => {
      this.isGameOver = false;
      this.soundService.startBackgroundMusic();
    }, 3000);
  }

  private handleWin(): void {
    this.gameStatus = GameStatus.ended;
    this.isGameOver = false;
    this.timer.stop();
    this.confettiComponent.launchConfetti();
    this.soundService.playSound("win");

    this.gameService.new_record({
      "milliseconds": this.gameTime,
      "difficulty": this.currentDifficulty,
    });
  }

  flag(cell: Cell): void {
    if (this.gameStatus !== GameStatus.started || cell.status === 'clear') return;

    const newStatus = cell.status === 'flag' ? 'open' : 'flag';
    if (newStatus === 'flag' && this.remainingFlags === 0) return;

    cell.status = newStatus;
    this.remainingFlags += cell.status === 'flag' ? -1 : 1;
    this.soundService.checkGameInteraction();
  }

  protected openMine() {
    if (this.gameStatus == GameStatus.started) {
      const hint = this.board.getHint();
      if (hint) {
        this.coinsService.open_mine().subscribe((res: any) => {
          if (res.message == "ok") {
            hint.status = 'flag';
            this.gameService.updateCoins();
          }
          else if (res.message == "neok") {
            this.openSnackbar("Спасать нечего...", "Недостаточно средств", 3000);
          }
        })
      }
      else this.openSnackbar("Спасатель монет", "Кажется подсказок нет...", 3000);
    }
    else this.openSnackbar("Спасатель монет", "Игра не начата!", 3000);
  }

  reset(): void {
    this.gameStatus = GameStatus.init;
    this.isGameOver = false;
    this.initializeBoard();
    this.timer.timerReset();
    this.firstClicked = false;
    this.soundService.checkGameInteraction();
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