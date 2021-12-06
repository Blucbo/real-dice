import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { FarkleGame } from 'src/game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  game!: FarkleGame;

  constructor(private location: Location) {
  }

  ngOnInit() {
    console.log(this.location.getState());
    this.game = new FarkleGame();
    this.game.start("gameContainer");
  }

  throwDices() {
    this.game.throwDices([1, 2, 3, 4, 5, 6]);
  }
}
