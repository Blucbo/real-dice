import { BaseBet } from './../core/models/index';
import { map, tap } from 'rxjs/operators';
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
  public nfts$: Observable<NftWithID[]> = this.allNfts.data$.pipe(
    tap(nfts => {
      this.hasNft = !!nfts.length
  }));
  public hasNft: boolean = false;
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
      this.chosenNft.setValue(firstNft);
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
    const baseBet = +(prompt("Please enter base bet (uScrt)", "1000000") || "1000000");
    const nft = this.chosenNft.value;
    if (!this.isValidPointToBet(nft as NftWithID, baseBet)) {return};

    await this.blockchainService.createNewGameRoom(this.chosenNft.value.id, baseBet !== NaN ? baseBet : 1000000);
    this.refresh();
  }

  async join(gameId: number, gameStatus: GameStatus, bet: number) {
    const nft = this.chosenNft.value;
    if (!this.isValidPointToBet(nft as NftWithID, bet)) {return};

    if (gameStatus === 'pending') {
      await this.blockchainService.joinGame(gameId, this.chosenNft.value.id || '', bet);
    }
    this.router.navigateByUrl('/game', {
      state: {
        gameId,
        color: this.chosenNft.value.nft_info.extension.attributes[0].value,
      }
    });
  }

  async joinDao() {
    await this.blockchainService.joinDao();
    this.refreshNft();
  }

  calc_max_bet(xp: number) {
    if (xp < 10) {
      return 1;
    } else if (xp >= 10 && xp < 20) {
      return 2;
    } else if (xp >=20 && xp < 40) {
      return 4
    } else {
      return 8
    }
  }

  private isValidPointToBet(nft: NftWithID, baseBet: number) {
    if (nft.nft_info.extension.xp < 10 && baseBet > 1 * 1000000) {
      alert("You have not enought xp to bet " + baseBet);
      return false;
    }

    if (nft.nft_info.extension.xp > 10 && nft.nft_info.extension.xp < 20 && baseBet > 2 * 1000000) {
      alert("You have not enought xp to bet " + baseBet);
      return false;
    }

    if (nft.nft_info.extension.xp > 20 && nft.nft_info.extension.xp < 40 && baseBet > 4 * 1000000) {
      alert("You have not enought xp to bet " + baseBet);
      return false;
    }

    if (nft.nft_info.extension.xp > 40 && baseBet > 8 * 1000000) {
      alert("You have not enought xp to bet " + baseBet);
      return false;
    }

    return true;
  }
}
