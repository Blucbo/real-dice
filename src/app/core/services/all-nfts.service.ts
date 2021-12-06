import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {BlockchainService} from "./blockchain.service";

@Injectable({
  providedIn: 'root'
})
export class AllNftsService {
  emitter$ = new BehaviorSubject<void>(undefined);
  data$: Observable<any>

  constructor(private blockchainService: BlockchainService) {
    this.data$ = new BehaviorSubject([
      {'nft_id': 'mock_1'},
      {'nft_id': 'mock_2'}
    ]);
      // combineLatest([
      //   this.blockchainService.isConnected$,
      //   this.emitter$
      // ])
      //   .pipe(
      //     filter(([isConnected, _]) => !!isConnected),
      //     switchMap(() => {
      //       return from(this.blockchainService.getNftTokens());
      //     }),
      //
      //   );

    this.data$.subscribe((v => console.log('v: ', v)));
  }

  refresh() {
    this.emitter$.next(undefined)
  }
}
