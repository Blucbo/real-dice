import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';

import {BlockchainAccount} from '../core/models';
import {BlockchainService} from "../core/services/blockchain.service";
import {AllGamesService} from "../core/services/all-games.service";
import {Router} from "@angular/router";
import {AllNftsService} from "../core/services/all-nfts.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public account$: Observable<BlockchainAccount> = this.blockchainService.account$;
  public games$: Observable<any[]> = this.allGames.data$;
  public nfts$: Observable<any[]> = this.allNfts.data$;


  constructor(
    private blockchainService: BlockchainService,
    private allGames: AllGamesService,
    private allNfts: AllNftsService,
    private router: Router) {
  }

  ngOnInit(): void {
  }

  async connectToWallet() {
    await this.blockchainService.connectToWallet();
  }

  refresh() {
    this.allGames.refresh();
  }

  refreshNft() {
    this.allNfts.refresh();
  }

  async join(id: number) {
    const res = await this.blockchainService.joinGame(id);
    this.router.navigateByUrl('/game', { state: { id: id } });
  }
}
