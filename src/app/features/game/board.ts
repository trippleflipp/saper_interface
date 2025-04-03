import { Cell } from './cell';

const PEERS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

export class Board {
    cells: Cell[][] = [];
    private remainingCells = 0;
    private mineCount = 0;
    private size: number;
    private mines: number;
    private firstClickRow: number | null = null;
    private firstClickCol: number | null = null;
  
    constructor(size: number, mines: number) {
      this.size = size;
      this.mines = mines;
  
      for (let y = 0; y < size; y++) {
        this.cells[y] = [];
        for (let x = 0; x < size; x++) {
          this.cells[y][x] = new Cell(y, x);
        }
      }
    }

    generateBoard(firstClickRow: number, firstClickCol: number): void {
        this.firstClickRow = firstClickRow;
        this.firstClickCol = firstClickCol;
        // Располагаем мины, избегая окрестности первого клика
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const cell = this.getRandomCell();
            if (!cell.mine && !this.isNearFirstClick(cell)) {
                cell.mine = true;
                minesPlaced++;
            }
        }

        // Рассчитываем количество мин вокруг каждой ячейки
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                let adjacentMines = 0;
                for (const peer of PEERS) {
                    if (
                        this.cells[y + peer[0]] &&
                        this.cells[y + peer[0]][x + peer[1]] &&
                        this.cells[y + peer[0]][x + peer[1]].mine
                    ) {
                        adjacentMines++;
                    }
                }
                this.cells[y][x].proximityMines = adjacentMines;

                if (this.cells[y][x].mine) {
                    this.mineCount++;
                }
            }
        }
        this.remainingCells = this.size * this.size - this.mineCount;
    }

    private isNearFirstClick(cell: Cell): boolean {
        if (this.firstClickRow === null || this.firstClickCol === null) {
            return false;
        }

        const rowDiff = Math.abs(cell.row - this.firstClickRow);
        const colDiff = Math.abs(cell.column - this.firstClickCol);

        return rowDiff <= 1 && colDiff <= 1;
    }

    getRandomCell(): Cell {
        const y = Math.floor(Math.random() * this.cells.length);
        const x = Math.floor(Math.random() * this.cells[y].length);
        return this.cells[y][x];
    }

  checkCell(cell: Cell): 'gameover' | 'win' | undefined {
    if (cell.status !== 'open') {
      return;
    } 
    else if (cell.mine) {
      this.revealAll();
      return 'gameover';
    } 
    else {
      cell.status = 'clear';
      this.remainingCells--;

      if(cell.proximityMines === 0) {
        for(const peer of PEERS) {
          if (
            this.cells[cell.row + peer[0]] &&
            this.cells[cell.row + peer[0]][cell.column + peer[1]]
          ) {
            this.checkCell(this.cells[cell.row + peer[0]][cell.column + peer[1]]);
          }
        }
      }

      if (this.remainingCells === 0) {
        return 'win';
      }
      return;
    }
  }

  revealAll() {
    for (const row of this.cells) {
      for (const cell of row) {
        if (cell.status === 'open') {
          cell.status = 'clear';
        }
      }
    }
  }

  getHint(): Cell | null {
    // Find a safe cell that hasn't been revealed yet
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const cell = this.cells[y][x];
        if (!cell.mine && cell.status === 'open') {
          return cell;
        }
      }
    }
    return null;
  }
}