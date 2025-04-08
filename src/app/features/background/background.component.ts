import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-background',
  standalone: true,
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class GameBackgroundComponent {
  public _backgroundType: 'game' | 'auth' | 'burger';

  backgrounds = {
    game: 'assets/images/game-bg.jpg',
    burger: 'assets/images/burger-menu-bg.jpg',
    auth: 'assets/images/auth-bg.jpg'
  };

  get currentBackground(): string {
    return this.backgrounds[this._backgroundType];
  }

  @Input() set backgroundType(value: 'game' | 'auth' | 'burger') {
    setTimeout(() => {
      this._backgroundType = value;
    });
  }
}
