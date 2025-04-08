import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../features/header/header.component";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { GameService } from '../../core/services/game.service';
import { map, Observable, Subscription } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { LeaderboardCardComponent } from "../../features/leaderboard-card/leaderboard-card.component";
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { LeaderTable } from '../../interfaces/leader-table.model';
import { LeaderboardData } from '../../interfaces/leaderboard-data.model';

@Component({
  selector: 'app-leader-table',
  imports: [
    HeaderComponent,
    AsyncPipe,
    NgIf,
    LeaderboardCardComponent,
    MatButtonToggleModule,
    FormsModule
  ],
  templateUrl: './leader-table.component.html',
  styleUrl: './leader-table.component.scss'
})
export class LeaderTableComponent implements OnInit {
  leaderboardData$: Observable<LeaderboardData>;
  displayedColumns: string[] = ['position', 'playername', 'time'];
  selectedDifficulty: string = 'hard';

  easyDataSource: MatTableDataSource<LeaderTable>;
  mediumDataSource: MatTableDataSource<LeaderTable>;
  hardDataSource: MatTableDataSource<LeaderTable>;

  private leaderboardSubscription: Subscription;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.leaderboardData$ = this.gameService.get_records().pipe(
      map((data: any) => {
        const leaderboard: LeaderboardData = {
          easy: this.filterBestAttempts(data.easy || []),
          medium: this.filterBestAttempts(data.medium || []),
          hard: this.filterBestAttempts(data.hard || [])
        };

        this.easyDataSource = new MatTableDataSource(leaderboard.easy);
        this.mediumDataSource = new MatTableDataSource(leaderboard.medium);
        this.hardDataSource = new MatTableDataSource(leaderboard.hard);

        return leaderboard;
      })
    );
  }

  private filterBestAttempts(records: any[]): LeaderTable[] {
    if (!Array.isArray(records)) return [];
    
    // Создаем Map для хранения лучшего времени каждого игрока
    const bestTimes = new Map<string, number>();
    
    // Находим лучшее время для каждого игрока
    records.forEach(record => {
      const currentBest = bestTimes.get(record.username);
      if (!currentBest || record.milliseconds < currentBest) {
        bestTimes.set(record.username, record.milliseconds);
      }
    });

    // Создаем массив только с лучшими результатами
    const bestRecords = Array.from(bestTimes.entries())
      .map(([username, milliseconds]) => ({
        username,
        milliseconds
      }))
      .sort((a, b) => a.milliseconds - b.milliseconds);

    // Преобразуем в формат LeaderTable
    return bestRecords.map((record, index) => ({
      playername: record.username,
      position: index + 1,
      time: record.milliseconds
    }));
  }

  ngOnDestroy(): void {
    if (this.leaderboardSubscription) {
      this.leaderboardSubscription.unsubscribe();
    }
  }
}
