import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, from, Observable } from "rxjs";

import { BlockchainService } from "./blockchain.service";
import { filter, map, switchMap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AllGamesService {
  emitter$ = new BehaviorSubject<void>(undefined);
  currentGame$ = new BehaviorSubject<any>(undefined);

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
              this.blockchainService.getStreamGamesByStatus('pending'),
              this.blockchainService.getStreamGamesByStatus('started'),
              this.blockchainService.getStreamGamesByStatus('re_roll'),
            ]).pipe(
              map(([pending, started, reRoll])=> [...pending, ...started, ...reRoll]),
              map(list => list.map(([gameId, value]) => ({
                game_id: gameId,
                ...value,
              })))
            );
          }),
        );
  }

  refresh() {
    this.emitter$.next(undefined)
  }

  async loadGame(gameId: number) {
    const currentGame = await this.blockchainService.getGameById(gameId);
    this.currentGame$.next(currentGame);
  }
}
