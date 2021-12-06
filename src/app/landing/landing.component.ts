import { Component, OnInit } from '@angular/core';
import {BlockchainService} from "../core/services/blockchain.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  constructor(private blockchainService: BlockchainService, private router: Router) { }

  ngOnInit(): void {
  }

  async connectToWallet() {
    await this.blockchainService.connectToWallet();
    this.router.navigate(['/home']);
  }

}
