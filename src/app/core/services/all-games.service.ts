import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, from, Observable} from "rxjs";

import {BlockchainService} from "./blockchain.service";
import {filter, switchMap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AllGamesService {
  emitter$ = new BehaviorSubject<void>(undefined);
  data$: Observable<any>

  constructor(private blockchainService: BlockchainService) {
    this.data$ =
      combineLatest([
        this.blockchainService.isConnected$,
        this.emitter$
      ])
        .pipe(
          filter(([isConnected, _]) => !!isConnected),
          switchMap(() => {
            return from(this.blockchainService.getGamesByStatus('pending'));
          }),
        );
  }

  refresh() {
    this.emitter$.next(undefined)
  }
}
