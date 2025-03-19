import { Component } from '@angular/core';
import { GameComponent } from '../../features/game/game.component';
import { HeaderComponent } from '../../features/header/header.component';

@Component({
  selector: 'app-guest',
  imports: [
    GameComponent,
    HeaderComponent
  ],
  templateUrl: './guest.component.html',
  styleUrl: './guest.component.scss'
})
export class GuestComponent {

}
