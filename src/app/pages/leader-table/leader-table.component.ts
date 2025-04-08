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
import { SoundService } from '../../core/services/sound.service';
import { GameBackgroundComponent } from '../../features/background/background.component';

@Component({
  selector: 'app-leader-table',
  imports: [
    HeaderComponent,
    AsyncPipe,
    NgIf,
    LeaderboardCardComponent,
    MatButtonToggleModule,
    FormsModule,
    GameBackgroundComponent
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

  constructor(
    private gameService: GameService,
    private soundService: SoundService
  ) {}

  ngOnInit(): void {
    this.soundService.setGameActive(true);
    this.leaderboardData$ = this.gameService.get_records().pipe(
      map((data: any) => {
        const leaderboard: LeaderboardData = {
          easy: (data.easy && Array.isArray(data.easy)) ? data.easy.map((item: any, index: any) => ({
            playername: item.username,
            position: index + 1,
            time: item.milliseconds
          })) : [],
          medium: (data.medium && Array.isArray(data.medium)) ? data.medium.map((item: any, index: any) => ({
            playername: item.username,
            position: index + 1,
            time: item.milliseconds
          })) : [],
          hard: (data.hard && Array.isArray(data.hard)) ? data.hard.map((item: any, index: any) => ({
            playername: item.username,
            position: index + 1,
            time: item.milliseconds
          })) : []
        };

        this.easyDataSource = new MatTableDataSource(leaderboard.easy);
        this.mediumDataSource = new MatTableDataSource(leaderboard.medium);
        this.hardDataSource = new MatTableDataSource(leaderboard.hard);

        return leaderboard;
      })
    );
  }

  ngOnDestroy(): void {
    if (this.leaderboardSubscription) {
      this.leaderboardSubscription.unsubscribe();
    }
  }
}
