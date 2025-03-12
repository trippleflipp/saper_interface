import { AfterContentInit, AfterViewInit, Component, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { Board } from './board';
import { Cell } from './cell';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { SvoComponent } from "../svo/svo.component";
import { TimerComponent } from "./timer/timer.component";

@Component({
  selector: 'app-game',
  imports: [
    NgFor,
    NgIf,
    NgClass,
    SvoComponent,
    TimerComponent
],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  @ViewChild(TimerComponent) timer: TimerComponent;
  firstClicked: boolean = false;
  board: Board;

  constructor() {
    this.board = new Board(20, 30);
  }

  checkCell(cell: Cell) {
    if (!this.firstClicked) {
      this.timer.startStop();
      this.firstClicked = true;
    }
    const result = this.board.checkCell(cell);
    if (result === 'gameover') {
      this.timer.startStop();
      this.firstClicked = false;
      alert('You lose');
    }
    else if (result === 'win') {
      this.timer.startStop();
      this.firstClicked = false;
      alert('you win');
    }
  }

  flag(cell: Cell) {
    if (cell.status !== 'clear') {
      if (cell.status === 'flag') {
        cell.status = 'open';
      }
      else {
        cell.status = 'flag';
      }
    }
  }

  reset() {
    this.board = new Board(20, 30);
    this.timer.timerReset()
  }

  getProximityClass(cell: Cell): string {
    return `proximity-${cell.proximityMines}`;
  }
}