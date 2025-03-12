import { Component } from '@angular/core';
import { Board } from './board';
import { Cell } from './cell';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { SvoComponent } from "../svo/svo.component";

@Component({
  selector: 'app-game',
  imports: [
    NgFor,
    NgIf,
    NgClass,
    SvoComponent
],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  board: Board;
  constructor() {
    this.reset();
  }

  checkCell(cell: Cell) {
    const result = this.board.checkCell(cell);
    if (result === 'gameover') {
      alert('You lose');
    } else if (result === 'win') {
      alert('you win');
    }
  }

  flag(cell: Cell) {
    if (cell.status === 'flag') {
      cell.status = 'open';
    } else {
      cell.status = 'flag';
    }
  }

  reset() {
    this.board = new Board(20, 30);
  }

  getProximityClass(cell: Cell): string {
    return `proximity-${cell.proximityMines}`;
  }
}