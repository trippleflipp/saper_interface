import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audio: HTMLAudioElement;
  isMusicEnabled$ = new BehaviorSubject<boolean>(false);
  isSoundEnabled$ = new BehaviorSubject<boolean>(true);

  constructor() {
    this.audio = new Audio('assets/sounds/background-music.mp3');
    this.audio.loop = true;
  }

  toggleMusic(): void {
    const currentState = this.isMusicEnabled$.getValue();
    if (currentState) {
      this.audio.pause();
    } else {
      this.audio.play().catch(error => {
        console.error('Ошибка воспроизведения музыки:', error);
      });
    }
    this.isMusicEnabled$.next(!currentState);
  }

  toggleSound(): void {
    const currentState = this.isSoundEnabled$.getValue();
    this.isSoundEnabled$.next(!currentState);
  }

  setMusicVolume(volume: number): void {
    this.audio.volume = volume;
  }

  playSound(soundName: string): void {
    if (!this.isSoundEnabled$.getValue()) return;
    
    const audio = new Audio(`assets/sounds/${soundName}.mp3`);
    audio.play().catch(error => {
      console.error('Ошибка воспроизведения звука:', error);
    });
  }
} 