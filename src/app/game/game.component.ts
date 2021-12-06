import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { FarkleGame } from 'src/game';
import { AllGamesService } from '../core/services/all-games.service';
import { Observable } from 'rxjs';
import { BlockchainService } from '../core/services/blockchain.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  game!: FarkleGame;
  currentGame$: Observable<any> = this.allGames.currentGame$;

  constructor(
    private location: Location,
    private router: Router,
    private allGames: AllGamesService,
    private blockchainService: BlockchainService) { }

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
    if (gameId != null) {
      const throwDicesResult = await this.blockchainService.rollDices(gameId)
      this.game.throwDices(throwDicesResult);
    } else {
      this.router.navigate(['/main']);
    }
  }
}
