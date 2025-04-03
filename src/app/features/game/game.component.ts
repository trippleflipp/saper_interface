import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Board } from './board';
import { Cell } from './cell';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { TimerComponent } from "./timer/timer.component";
import { ConfettiComponent } from '../confetti/confetti.component';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SnackbarData } from '../../interfaces/snackbardata.model';
import { GameStatus, GameDifficulty } from '../../interfaces/game-status.enum';
import { SoundService } from '../../core/services/sound.service';
import { CoinsService } from '../../core/services/coins.service';
import { AuthService } from '../../core/services/auth.service';

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
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild(ConfettiComponent) confettiComponent!: ConfettiComponent;
  @ViewChild(TimerComponent) timer!: TimerComponent;
  
  firstClicked = false;
  gameStatus: GameStatus = GameStatus.init;
  board!: Board;
  gameTime = 0;
  currentDifficulty: GameDifficulty = GameDifficulty.medium;
  GameDifficulty = GameDifficulty;
  GameStatus = GameStatus;
  remainingFlags = 0;
  isGameOver = false;
  userCoins = 0;
  readonly HINT_COST = 10;
  
  private readonly difficultySettings: Record<GameDifficulty, DifficultySettings> = {
    [GameDifficulty.easy]: { size: 9, mines: 8 },
    [GameDifficulty.medium]: { size: 12, mines: 20 },
    [GameDifficulty.hard]: { size: 16, mines: 40 }
  };

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private soundService: SoundService,
    private coinsService: CoinsService,
    private authService: AuthService
  ) {
    this.initializeBoard();
    this.userCoins = this.coinsService.getCurrentCoins();
    this.coinsService.coins$.subscribe(coins => {
      this.userCoins = coins;
    });
  }

  ngOnInit(): void {
    this.soundService.setGameActive(true);
  }

  ngOnDestroy(): void {
    this.soundService.setGameActive(false);
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
    
    this.openSnackbar(
      "На одного сталкера в Зоне стало меньше...", 
      `Время: ${this.formatTime(this.gameTime)}`, 
      4000
    );
    
    this.soundService.stopBackgroundMusic();
    this.soundService.playSound("fail-wha-wha");
    
    setTimeout(() => {
      this.isGameOver = false;
      this.soundService.startBackgroundMusic();
    }, 4000);
  }

  private handleWin(): void {
    this.gameStatus = GameStatus.ended;
    this.isGameOver = false;
    this.timer.stop();
    
    // Add coins for winning
    this.coinsService.addCoins(15);
    
    this.confettiComponent.launchConfetti();
    this.openSnackbar(
      "Победа! Вы нашли артефакт!", 
      `Время: ${this.formatTime(this.gameTime)} | +15 монет`, 
      4000
    );
    
    this.soundService.playSound("win");
  }

  flag(cell: Cell): void {
    if (this.gameStatus !== GameStatus.started || cell.status === 'clear') return;

    const newStatus = cell.status === 'flag' ? 'open' : 'flag';
    if (newStatus === 'flag' && this.remainingFlags === 0) return;

    cell.status = newStatus;
    this.remainingFlags += cell.status === 'flag' ? -1 : 1;
    this.soundService.checkGameInteraction();
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

  useHint(): void {
    if (this.gameStatus !== GameStatus.started || !this.coinsService.useCoins(this.HINT_COST)) {
      this.openSnackbar(
        "Недостаточно монет", 
        `Для подсказки нужно ${this.HINT_COST} монет`, 
        2000
      );
      return;
    }

    // Find a safe cell that hasn't been revealed yet
    const hint = this.board.getHint();
    if (hint) {
      // Save original status to restore after animation
      const originalStatus = hint.status;
      // Show hint animation
      hint.status = 'hint';
      
      // Reset cell status after animation
      setTimeout(() => {
        if (hint.status === 'hint') { // Only reset if it wasn't clicked during animation
          hint.status = originalStatus;
        }
      }, 3000); // 3000ms = 2 iterations of 1.5s animation
    } else {
      // Refund coins if no hint available
      this.coinsService.addCoins(this.HINT_COST);
      this.openSnackbar(
        "Нет доступных подсказок", 
        "Все безопасные клетки уже открыты", 
        2000
      );
    }
  }

  showHintInfo(): void {
    const dialogRef = this.dialog.open(HintInfoDialogComponent, {
      width: '400px',
      panelClass: 'hint-info-dialog'
    });
  }
}

@Component({
  selector: 'app-hint-info-dialog',
  template: `
    <h2 mat-dialog-title>Как работает подсказка?</h2>
    <mat-dialog-content>
      <p>Подсказка поможет вам найти безопасную клетку на игровом поле.</p>
      <ul>
        <li>Стоимость одной подсказки: {{ HINT_COST }} монет</li>
        <li>При использовании подсказки, безопасная клетка будет подсвечена зеленым цветом на 3 секунды</li>
        <li>Подсказка гарантированно указывает на клетку без мины</li>
      </ul>
      <p><strong>Примечание:</strong> Подсказка доступна только во время игры и при наличии достаточного количества монет.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Понятно</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 20px;
      
      ul {
        padding-left: 20px;
        margin: 16px 0;
      }
      
      li {
        margin-bottom: 8px;
      }
    }
  `],
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
  ]
})
export class HintInfoDialogComponent {
  readonly HINT_COST = 10;
}