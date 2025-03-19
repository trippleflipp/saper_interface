import { Component, ElementRef, ViewChild } from '@angular/core';
import JSConfetti from 'js-confetti';

@Component({
  selector: 'app-confetti',
  imports: [],
  templateUrl: './confetti.component.html',
  styleUrl: './confetti.component.scss'
})
export class ConfettiComponent {
  @ViewChild('confettiCanvas') confettiCanvas: ElementRef | undefined;
  private jsConfetti: JSConfetti | undefined;

  constructor() {}

  ngAfterViewInit(): void {
    if (this.confettiCanvas) {
      this.jsConfetti = new JSConfetti({ canvas: this.confettiCanvas.nativeElement });
    } else {
      console.error('Canvas element not found!');
    }
  }

  public launchConfetti(): void {
    if (this.jsConfetti) {
      this.jsConfetti.addConfetti({
        confettiColors: [
          '#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7',
        ],
        emojis: ['🌈', '✨', '🎈', '🎉', '🎊'],
        emojiSize: 30,
        confettiRadius: 6,
        confettiNumber: 200,
      });
    } else {
      console.error('jsConfetti is not initialized!');
    }
  }
}
