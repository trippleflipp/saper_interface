import { Component } from '@angular/core';
import { HeaderComponent } from "../../features/header/header.component";
import { MatTableModule } from '@angular/material/table';

const leaderboardData = [
  { playername: 'Alice', position: 1 },
  { playername: 'Bob', position: 2 },
  { playername: 'Charlie', position: 3 },
  { playername: 'David', position: 4 },
  { playername: 'Eve', position: 5 },
  { playername: 'Finn', position: 6 },
  { playername: 'Grace', position: 7 },
  { playername: 'Henry', position: 8 },
  { playername: 'Ivy', position: 9 },
  { playername: 'Jack', position: 10 }
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
  displayedColumns: string[] = ['position', 'playername'];
}
