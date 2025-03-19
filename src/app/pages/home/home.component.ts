import { Component } from '@angular/core';
import { GameComponent } from "../../features/game/game.component";
import { HeaderComponent } from "../../features/header/header.component";

@Component({
  selector: 'app-home',
  imports: [GameComponent, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
