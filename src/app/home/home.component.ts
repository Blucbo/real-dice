import { Component, OnInit } from '@angular/core';
import {IdentityService} from "../core/services/identity.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public counter = 1;
  public test!: string;
  constructor(private identityService: IdentityService) { }

  ngOnInit(): void {
    this.test = this.identityService.value;
    this.identityService.value$.subscribe(v => console.log('emit when change ', v));
  }

  change() {
    this.identityService.setValue('new value' + this.counter++);
  }

}
