import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from "./game/game.component";
import {HomeComponent} from "./home/home.component";
import {LandingComponent} from "./landing/landing.component";

const routes: Routes = [
  { path: 'game', component: GameComponent },
  { path: 'home', component: HomeComponent },
  { path: 'main', component: LandingComponent },
  { path: '',   redirectTo: '/main', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
