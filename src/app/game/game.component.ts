import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { FarkleGame } from 'src/game';
import { Observable } from 'rxjs';
import { AllGamesService } from '../core/services/all-games.service';
import { Game } from '../core/models';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  game!: FarkleGame;
  public readonly currentGame$: Observable<Game> = this.allGames.currentGame$;
  public readonly canThrow$: Observable<boolean> = this.allGames.myTurn$;
  public readonly numberToImageMap: { [key: number]: string } = {
    1: "la-dice-one",
    2: "la-dice-two",
    3: "la-dice-three",
    4: "la-dice-four",
    5: "la-dice-five",
    6: "la-dice-six",
  }

  constructor(
    private location: Location,
    private allGames: AllGamesService,
    private gamesService: AllGamesService) { }

  ngOnInit() {
    this.game = new FarkleGame();
    this.game.start("gameContainer");
    const { gameId } = this.location.getState() as any;
    if (gameId != null) {
      this.allGames.loadGame(gameId);
    }
  }

  async throwDices() {
    const { gameId } = this.location.getState() as any;
    const throwDicesResult = await this.gamesService.roll(gameId as number);
    this.game.throwDices(throwDicesResult);
  }
}
