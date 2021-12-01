import { Component, OnInit } from '@angular/core';
import { IdentityService } from "../core/services/identity.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public address!: string | null;
  constructor(private identityService: IdentityService) { }

  ngOnInit(): void {
    this.identityService.address$.subscribe(v => this.address = v);
  }

  async connectToWallet() {
    await this.identityService.connectToWallet();
  }
}
