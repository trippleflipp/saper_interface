import { Component, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';
import { HeaderComponent } from "../../features/header/header.component";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { GameService } from '../../core/services/game.service';
import { map, Observable, Subscription } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';


export interface LeaderTable {
  playername: string;
  position: number;
  time: number;
}

export interface LeaderboardData {
  easy: LeaderTable[];
  medium: LeaderTable[];
  hard: LeaderTable[];
}

@Component({
  selector: 'app-leader-table',
  imports: [
    HeaderComponent,
    MatTableModule,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './leader-table.component.html',
  styleUrl: './leader-table.component.scss'
})
export class LeaderTableComponent implements OnInit {
  leaderboardData$: Observable<LeaderboardData>;
  displayedColumns: string[] = ['position', 'playername', 'time'];

  easyDataSource: MatTableDataSource<LeaderTable>;
  mediumDataSource: MatTableDataSource<LeaderTable>;
  hardDataSource: MatTableDataSource<LeaderTable>;

  private leaderboardSubscription: Subscription;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
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

  formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
  
}
