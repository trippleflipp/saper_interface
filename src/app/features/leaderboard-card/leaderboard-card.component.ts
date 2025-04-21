import { NgStyle } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { fromEvent } from 'rxjs';
import { delay, map, mapTo, merge, repeat, share, switchMap, takeUntil } from 'rxjs/operators';

interface CardTransform {
  transform: string;
  border?: string;
  padding?: string;
  'box-shadow'?: string;
  'border-radius'?: string;
  'transition'?: string;
  'backdrop-filter'?: string;
  'background'?: string;
}

@Component({
  selector: 'app-leaderboard-card',
  imports: [
    NgStyle,
    MatTableModule
  ],
  templateUrl: './leaderboard-card.component.html',
  styleUrl: './leaderboard-card.component.scss'
})
export class LeaderboardCardComponent implements OnInit, AfterViewInit {
  @Input() dataSource: MatTableDataSource<any>;
  @Input() displayedColumns: string[];
  @Input() difficulty: string;
  @Input() color: string;
  @ViewChild('card', { static: true }) card: ElementRef;

  private height: number = 580;
  private width: number;
  private mouseX: number = 0;
  private mouseY: number = 0;



  ngOnInit(): void {
    this.setupMouseTracking();
  }

  ngAfterViewInit(): void {
    this.width = this.card.nativeElement.offsetWidth;
    this.height = this.card.nativeElement.offsetHeight;
  }

  private setupMouseTracking(): void {
    const mouseMove$ = fromEvent<MouseEvent>(this.card.nativeElement, 'mousemove');
    const mouseLeave$ = fromEvent<MouseEvent>(this.card.nativeElement, 'mouseleave').pipe(
      delay(10),
      mapTo({ mouseX: 0, mouseY: 0 }),
      share()
    );
    const mouseEnter$ = fromEvent<MouseEvent>(this.card.nativeElement, 'mouseenter').pipe(
      takeUntil(mouseLeave$)
    );

    mouseEnter$.pipe(
      switchMap(() => mouseMove$),
      map((e: MouseEvent) => ({
        mouseX: e.pageX - this.nativeElement.offsetLeft - this.width / 2,
        mouseY: e.pageY - this.nativeElement.offsetTop - this.height / 2
      })),
      merge(mouseLeave$),
      repeat()
    ).subscribe(({ mouseX, mouseY }) => {
      this.mouseX = mouseX;
      this.mouseY = mouseY;
    });
  }

  private get mousePX(): number {
    return this.mouseX / this.width;
  }

  private get mousePY(): number {
    return this.mouseY / this.height;
  }

  cardStyle(): CardTransform {
    return this.transformStyle();
  }

  private transformStyle(): CardTransform {
    const tX = this.mousePX * -30;
    const tY = this.mousePY * -30;
    
    return {
      transform: `rotateY(${tX}deg) rotateX(${tY}deg)`,
      border: `3px solid ${this.color}`,
      padding: '10px',
      'box-shadow': `0px 0px 34px 0px ${this.color}, 0px 0px 20px rgba(0,0,0,0.3)`,
      'border-radius': '10px',
      'backdrop-filter': 'blur(5px)',
      'background': '#114a4bb9'
    };
  }

  private get nativeElement(): HTMLElement {
    return this.card.nativeElement;
  }

  formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
}