import { Component } from '@angular/core';
import { GameComponent } from '../../features/game/game.component';

@Component({
  selector: 'app-guest',
  imports: [
    GameComponent
  ],
  templateUrl: './guest.component.html',
  styleUrl: './guest.component.scss'
})
export class GuestComponent {

}
