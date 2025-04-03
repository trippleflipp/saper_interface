export class Cell {
    status: 'open' | 'clear' | 'flag' | 'hint' = 'open';
    mine = false;
    proximityMines = 0;
  
    constructor(public row: number, public column: number) {}
}