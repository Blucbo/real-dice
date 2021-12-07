import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, from, Observable, Subject } from "rxjs";

import { BlockchainService } from "./blockchain.service";
import { filter, map, switchMap, withLatestFrom } from "rxjs/operators";
import { Game } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AllGamesService {
  public readonly emitter$ = new BehaviorSubject<void>(undefined);
  public readonly currentGame$ = new Subject<Game>();
  public readonly myTurn$ = this.currentGame$.pipe(
    withLatestFrom(this.blockchainService.account$),
    map(([game, acc]) => {
      return (
        game.roll_turn === 'host' && game.host_player_address === acc.address
        || game.roll_turn === 'joined' && game.joined_player_address === acc.address
      );
    })
  )

  data$: Observable<any>;

  constructor(private blockchainService: BlockchainService) {
    this.data$ =
      combineLatest([
        this.blockchainService.isConnected$,
        this.emitter$
      ])
        .pipe(
          filter(([isConnected, _]) => !!isConnected),
          switchMap(() => {
            return forkJoin([
              from(this.blockchainService.getGamesByStatus('pending')),
              from(this.blockchainService.getGamesByStatus('started')),
              from(this.blockchainService.getGamesByStatus('re_roll')),
            ]).pipe(
              map(([pending, started, reRoll]) => [...pending, ...started, ...reRoll]),
            );
          }),
        );

    this.data$.subscribe(v => console.log('games: here ', v));
  }

  refresh() {
    this.emitter$.next(undefined)
  }

  async loadGame(gameId: number) {
    const currentGame = await this.blockchainService.getGameById(gameId);
    this.currentGame$.next(currentGame);
  }

  async roll(gameId: number) {
    const result = await this.blockchainService.rollDices(gameId);
    if (result != null) {
      const { rolls, game } = result;
      this.currentGame$.next(game);
      return rolls;
    }
    return [];
  }

  async reRoll(gameId: number, dices: boolean[]) {
    const result = await this.blockchainService.reRollDices(gameId, dices);
    if (result != null) {
      const { rolls, game } = result;
      this.currentGame$.next(game);
      return rolls;
    }
    return [];
  }
}
