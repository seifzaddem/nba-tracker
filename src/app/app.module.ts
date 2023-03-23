import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import { TeamStatsComponent } from './team-stats/team-stats.component';
import {FormsModule} from '@angular/forms';
import { GameResultsComponent } from './game-results/game-results.component';
import { GameStatsComponent } from './game-stats/game-stats.component';

@NgModule({
  declarations: [
    AppComponent,
    TeamStatsComponent,
    GameResultsComponent,
    GameStatsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
