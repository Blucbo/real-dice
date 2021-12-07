import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { BlockchainAccount, GameStatus } from '../core/models';
import { BlockchainService } from "../core/services/blockchain.service";
import { AllGamesService } from "../core/services/all-games.service";
import { Router } from "@angular/router";
import { AllNftsService } from "../core/services/all-nfts.service";

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

  async createNewGame() {
    const baseBet = +(prompt("Please enter base bet", "50") || "50");
    await this.blockchainService.createNewGameRoom('0', baseBet !== NaN ? baseBet : 50);
  }

  async join(gameId: number, gameStatus: GameStatus) {
    if (gameStatus === 'pending') {
      await this.blockchainService.joinGame(gameId, '0');
    }
    this.router.navigateByUrl('/game', { state: { gameId } });
  }
}
