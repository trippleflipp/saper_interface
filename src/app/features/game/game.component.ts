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

  private readonly defeatPhrases: string[] = [
    "Ещё один сталкер, который не дошёл до Чёрного Брата...",
    "Зона не прощает невнимательности.",
    "Бум! И нет сталкера.",
    "В следующий раз... если будет следующий раз.",
    "Ты размазан по Зоне. Надеюсь, быстро.",
    "Мертвец. Ещё один.",
    "Новичкам здесь не место. Ты это подтвердил.",
    "Ты не первый. И не последний.",
    "Ну вот и всё. Теперь ты часть ландшафта.",
    "Мог бы стать легендой... но стал статистикой.",
    "Теперь твои кости будут пугать новичков.",
    "Долгари добавят тебя в список потерь.",
    "Даже собаки будут обходить это место.",
    "Ты не первый, кого разорвало в клочья. И не последний.",
    "Теперь ты — предупреждение для других.",
    "Ну что, в следующей жизни повезёт больше?",
    "Ты думал, что готов к Зоне. Зона думала иначе.",
    "Вот и всё. Ни артефактов, ни славы.",
    "Закончилось как обычно — смертью."
  ];

  private readonly victoryPhrases: string[] = [
    "Артефакт добыт, и ты еще жив. Редкое сочетание.",
    "Хорошая работа, сталкер. Теперь можешь выдохнуть.",
    "Повезло... На этот раз.",
    "Ты либо очень удачлив, либо очень умён. В Зоне это одно и то же.",
    "Чисто! Можешь идти дальше, пока Зона не передумала.",
    "Неплохо. Но расслабляться рано — впереди ещё много смертей.",
    "Ты прошел. Но помни: Зона не прощает ошибок.",
    "Молодец, сталкер. Теперь можешь отдохнуть.",
    "Обезврежено. Но кто знает, что ждёт за следующим поворотом?",
    "Тыыы... живой. Пока что.",
    "Ха! Да ты везунчик",
    "Неужели кто-то учил тебя этому? Или просто инстинкты?",
    "Ты прошел. Но помни — следующий шаг может быть последним.",
    "Неплохо. Но в следующий раз может не повезти.",
    "Ты явно не в первый раз играешь с смертью.",
    "Ты справился. Но удача — ненадёжный союзник."
  ];

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
    
    const randomPhrase = this.defeatPhrases[Math.floor(Math.random() * this.defeatPhrases.length)];
    
    this.openSnackbar(
      randomPhrase, 
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
    if (this.gameStatus == GameStatus.started) {
      if (this.remainingFlags <= 0) {
        this.openSnackbar("Спасатель монет", "Не осталось флажков!", 3000);
        return;
      }
      if (this.isHintLoading) {
        return;
      }
      const hint = this.board.getHint();
      if (hint) {
        this.isHintLoading = true;
        this.coinsService.open_mine().subscribe({
          next: (res: any) => {
            if (res.message == "ok") {
              hint.status = 'flag';
              this.remainingFlags--;
              this.gameService.updateCoins();
            }
            else if (res.message == "neok") {
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