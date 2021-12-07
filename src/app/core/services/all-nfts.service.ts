import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, from, Observable } from "rxjs";
import { filter, switchMap } from 'rxjs/operators';
import { BlockchainService } from "./blockchain.service";

@Injectable({
  providedIn: 'root'
})
export class AllNftsService {
  emitter$ = new BehaviorSubject<void>(undefined);
  data$: Observable<any>

  constructor(private blockchainService: BlockchainService) {
    this.data$ = combineLatest([
      this.blockchainService.isConnected$,
      this.emitter$
    ])
      .pipe(
        filter(([isConnected, _]) => !!isConnected),
        switchMap(() => {
          return from(this.blockchainService.getNftTokens());
        }),

      );
    this.data$.subscribe((v => console.log('v: ', v)));
  }

  refresh() {
    this.emitter$.next(undefined)
  }
}
