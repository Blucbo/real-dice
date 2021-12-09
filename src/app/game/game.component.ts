import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { FarkleGame } from 'src/game';
import { from, Observable, of } from 'rxjs';
import { AllGamesService } from '../core/services/all-games.service';
import { Game } from '../core/models';
import { BlockchainService } from '../core/services/blockchain.service';
import { delay, filter, first, switchMap, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  game!: FarkleGame;
  public readonly currentGame$: Observable<Game> = this.allGames.currentGame$;
  public readonly canThrow$: Observable<boolean> = this.allGames.myTurn$;
  public readonly canReThrow$: Observable<boolean> = this.allGames.myTurnReRoll$;
  public readonly numberToImageMap: { [key: number]: string } = {
    1: "la-dice-one",
    2: "la-dice-two",
    3: "la-dice-three",
    4: "la-dice-four",
    5: "la-dice-five",
    6: "la-dice-six",
  }
  public userColor = 'ffffff';

  private gameId: any;
  private rethrowArray = [false, false, false, false, false];

  constructor(
    private location: Location,
    private allGames: AllGamesService,
    private blockchainService: BlockchainService,
    private gamesService: AllGamesService,
    private route: Router,
  ) { }

  ngOnInit() {
    const { gameId, color } = this.location.getState() as any;
    this.gameId = gameId;
    this.userColor = color;
    if (gameId != null) {
      this.refresh()
    }

    this.game = new FarkleGame(this.click.bind(this), color);
    this.game.start("gameContainer");

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
    this.currentGame$.pipe(
      filter(game => game.status === 'finished'),
      first(),
      delay(3000),
      withLatestFrom(this.blockchainService.account$),
      switchMap(([game, acc]) => {
        const winnerRole =  game.joined_player_total_points > game.host_player_total_points ? "joined" : "host";
        const winnerPoints =  game.joined_player_total_points > game.host_player_total_points ? game.joined_player_total_points : game.host_player_total_points;
        confirm(`${winnerRole} win with score: ${winnerPoints}`)

        if (game.host_player_address === acc.address && game.host_player_total_points > game.joined_player_total_points) {
          return from(this.blockchainService.finishGame(this.gameId));
        }

        if (game.joined_player_address === acc.address && game.joined_player_total_points > game.host_player_total_points) {
          return from(this.blockchainService.finishGame(this.gameId));
        }

        return of();
      })
    ).subscribe((v) => {
      console.log('should be empty: ', v);
      this.route.navigate(['/home']);
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
