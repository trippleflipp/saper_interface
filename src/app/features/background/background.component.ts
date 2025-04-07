import { Component } from '@angular/core';

@Component({
  selector: 'app-background',
  standalone: true,
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
export class GameBackgroundComponent {
  backgroundImage = '../../assets/images/game-bg.jpg';
}
