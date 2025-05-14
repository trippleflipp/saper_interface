import { Component, Input, OnInit } from '@angular/core';
import { BackgroundService } from '../../services/background.service';

@Component({
  selector: 'app-background',
  standalone: true,
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class GameBackgroundComponent implements OnInit {
  public _backgroundType: 'game' | 'auth' | 'burger';

  backgrounds = {
    game: 'assets/images/game-bg.jpg',
    burger: 'assets/images/burger-menu-bg.jpg',
    auth: 'assets/images/auth-bg.jpg'
  };

  constructor(private backgroundService: BackgroundService) {}

  ngOnInit() {
    this.setBackground();
  }

  setBackground() {
    if (this._backgroundType === 'game') {
      this.backgrounds.game = this.backgroundService.getSelectedBackground();
    }
  }

  get currentBackground(): string {
    return this.backgrounds[this._backgroundType];
  }

  @Input() set backgroundType(value: 'game' | 'auth' | 'burger') {
    setTimeout(() => {
      this._backgroundType = value;
      if (value === 'game') {
        this.backgrounds.game = this.backgroundService.getSelectedBackground();
      }
    });
  }
}
