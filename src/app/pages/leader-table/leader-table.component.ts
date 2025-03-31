import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { HeaderComponent } from "../../features/header/header.component";
import { MatTableModule } from '@angular/material/table';

const leaderboardData = [
  { playername: 'Alice', position: 1, time: '00:02:22'},
  { playername: 'Bob', position: 2, time: '00:02:22' },
  { playername: 'Charlie', position: 3, time: '00:02:22' },
  { playername: 'David', position: 4, time: '00:02:22' },
  { playername: 'Eve', position: 5, time: '00:02:22' },
  { playername: 'Finn', position: 6, time: '00:02:22' },
  { playername: 'Grace', position: 7, time: '00:02:22' },
  { playername: 'Henry', position: 8, time: '00:02:22' },
  { playername: 'Ivy', position: 9, time: '00:02:22' },
  { playername: 'Jack', position: 10, time: '00:02:22' }
];

@Component({
  selector: 'app-leader-table',
  imports: [
    HeaderComponent,
    MatTableModule,
  ],
  templateUrl: './leader-table.component.html',
  styleUrl: './leader-table.component.scss'
})
export class LeaderTableComponent {
  mockData = leaderboardData;
  displayedColumns: string[] = ['position', 'playername', 'time'];
}
