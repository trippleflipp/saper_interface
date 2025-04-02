import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderDragEvent, MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { SoundService } from '../../core/services/sound.service';

@Component({
  selector: 'app-sound',
  standalone: true,
  imports: [
    MatIconModule,
    MatSliderModule,
    FormsModule,
    NgIf
  ],
  templateUrl: './sound.component.html',
  styleUrl: './sound.component.scss'
})
export class SoundComponent implements OnInit {
  showMusicSlider: boolean = false;
  showSoundSlider: boolean = false;

  constructor(public soundService: SoundService) {}

  ngOnInit(): void {
    this.soundService.onUserInteraction();
  }

  onMusicSliderChange(event: MatSliderDragEvent) {
    this.soundService.onMusicSliderChange(event.value);
  }

  onSoundSliderChange(event: MatSliderDragEvent) {
    this.soundService.onSoundSliderChange(event.value);
  }
}