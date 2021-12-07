import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { BlockchainAccount, GameStatus, NftWithID } from '../core/models';
import { BlockchainService } from "../core/services/blockchain.service";
import { AllGamesService } from "../core/services/all-games.service";
import { Router } from "@angular/router";
import { AllNftsService } from "../core/services/all-nfts.service";
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public account$: Observable<BlockchainAccount> = this.blockchainService.account$;
  public games$: Observable<any[]> = this.allGames.data$;
  public nfts$: Observable<NftWithID[]> = this.allNfts.data$;

  public chosenNft = new FormControl();

  constructor(
    private blockchainService: BlockchainService,
    private allGames: AllGamesService,
    private allNfts: AllNftsService,
    private router: Router,
    public fb: FormBuilder,
    ) {
  }

  ngOnInit(): void {
    this.nfts$.pipe(
      first()
    ).subscribe(([firstNft]) => {
      console.log('should call one time')
      this.chosenNft.setValue(firstNft.id);
    })

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
    const baseBet = +(prompt("Please enter base bet", "1") || "1");
    await this.blockchainService.createNewGameRoom(this.chosenNft.value, baseBet !== NaN ? baseBet : 50);
  }

  async join(gameId: number, gameStatus: GameStatus, bet: number) {
    if (gameStatus === 'pending') {
      await this.blockchainService.joinGame(gameId, this.chosenNft.value || '', bet);
    }
    this.router.navigateByUrl('/game', { state: { gameId } });
  }

  async joinDao() {
    await this.blockchainService.joinDao();
  }
}
