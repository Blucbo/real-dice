import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { FarkleGame } from 'src/game';
import { Observable } from 'rxjs';
import { BlockchainService } from '../core/services/blockchain.service';
import { Router } from '@angular/router';
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
    const throwDicesResult = await this.gamesService.roll(gameId as number || -1);
    this.game.throwDices(throwDicesResult);
  }
}
