import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { FarkleGame } from 'src/game';
import { Observable } from 'rxjs';
import { AllGamesService } from '../core/services/all-games.service';
import { Game } from '../core/models';
import { BlockchainService } from '../core/services/blockchain.service';

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

  private gameId: any;
  private rethrowArray = [false, false, false, false, false];

  constructor(
    private location: Location,
    private allGames: AllGamesService,
    private blockchainService: BlockchainService,
    private gamesService: AllGamesService) { }

  ngOnInit() {
    this.game = new FarkleGame(this.click.bind(this));
    this.game.start("gameContainer");
    const { gameId } = this.location.getState() as any;
    this.gameId = gameId;
    if (gameId != null) {
      this.refresh()
    }
    this.currentGame$.subscribe(game => {
      if (game != null) {
        const address = this.blockchainService.getAddess();
        if (address === game.host_player_address) {
          this.game.setDiceValues(game.host_player_rolls[0]);
        } else {
          this.game.setDiceValues(game.joined_player_rolls[0]);
        }
      }
    });
  }

  refresh() {
    this.allGames.loadGame(this.gameId)
  }

  click(index: number) {
    this.rethrowArray[index - 1] = !this.rethrowArray[index - 1];
  }

  async throwDices() {
    const rollResult = await this.gamesService.roll(this.gameId);
    this.game.throwDices(rollResult);
  }

  async reThrowDices() {
    const rollResult = await this.gamesService.reRoll(this.gameId, this.rethrowArray);
    this.game.throwDices(rollResult);
  }
}
