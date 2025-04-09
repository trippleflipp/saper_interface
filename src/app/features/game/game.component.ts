import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
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
import { defeatPhrases, victoryPhrases } from '../../interfaces/phrases';

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
    MatSnackBarModule
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy{
  @ViewChild(ConfettiComponent) confettiComponent!: ConfettiComponent;
  @ViewChild(TimerComponent) timer!: TimerComponent;

  private readonly defeatPhrases = defeatPhrases;
  private readonly victoryPhrases = victoryPhrases;

  coinsSubscription = new Subscription
  
  firstClicked = false;
  gameStatus: GameStatus = GameStatus.init;
  board!: Board;
  gameTime = 0;
  currentDifficulty: GameDifficulty = GameDifficulty.medium;
  GameDifficulty = GameDifficulty;
  remainingFlags = 0;
  isGameOver = false;
  isButtonFlagDisabled: boolean = false;
  currentCoins: number;
  isHintLoading = false;
  
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
    if (this.soundService.currentMusicPath !== 'assets/sounds/background-music.mp3') {
      this.soundService.changeBackgroundMusic('assets/sounds/background-music.mp3');
    }
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
      this.soundService.stopBackgroundMusic();
      this.soundService.changeBackgroundMusic('assets/sounds/game_music.mp3');
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
    this.soundService.stopBackgroundMusic();
    this.soundService.changeBackgroundMusic('assets/sounds/background-music.mp3');
    
    const randomPhrase = this.defeatPhrases[Math.floor(Math.random() * this.defeatPhrases.length)];
    
    this.openSnackbar(
      randomPhrase, 
      `Время: ${this.formatTime(this.gameTime)}`, 
      5000
    );
    this.soundService.playSound("defeat");
    
    setTimeout(() => {
      this.isGameOver = false;
    }, 3000);
  }

  private handleWin(): void {
    this.gameStatus = GameStatus.ended;
    this.isGameOver = false;
    this.timer.stop();
    this.confettiComponent.launchConfetti();
    this.soundService.stopBackgroundMusic();
    this.soundService.changeBackgroundMusic('assets/sounds/background-music.mp3');
    this.soundService.playSound("victory");

    const randomPhrase = this.victoryPhrases[Math.floor(Math.random() * this.victoryPhrases.length)];
    this.openSnackbar(
      randomPhrase,
      `Время: ${this.formatTime(this.gameTime)}`,
      6000
    );

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
    if (this.gameStatus !== GameStatus.started) {
        this.openSnackbar("Спасатель монет", "Игра не начата!", 3000);
        return;
    }
    if (this.remainingFlags <= 0) {
        this.openSnackbar("Спасатель монет", "Не осталось флажков!", 3000);
        return;
    }
    if (this.isHintLoading) {
        return;
    }
    const hint = this.board.getHint();
    if (!hint) {
        this.openSnackbar("Спасатель монет", "Кажется подсказок нет...", 3000);
        return;
    }

    this.isHintLoading = true;
    this.isButtonFlagDisabled = true;
    this.coinsService.open_mine().subscribe({
        next: (res: any) => {
            if (res.message === "ok") {
                hint.status = 'flag';
                this.remainingFlags--;
                this.gameService.updateCoins();
            } else if (res.message === "neok") {
                this.openSnackbar("Спасать нечего...", "Недостаточно средств", 3000);
            }
        },
        error: () => {
            this.openSnackbar("Ошибка", "Что-то пошло не так", 3000);
        },
        complete: () => {
            this.isHintLoading = false;
        }
    });
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