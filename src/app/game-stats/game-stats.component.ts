import { Component } from '@angular/core';
import {Team} from '../data.models';
import {Observable, tap} from 'rxjs';
import {NbaService} from '../nba.service';

export const CONFERENCE = ['West', 'East'] as const;

@Component({
  selector: 'app-game-stats',
  templateUrl: './game-stats.component.html',
  styleUrls: ['./game-stats.component.css']
})
export class GameStatsComponent {

  teams$: Observable<Team[]>;
  allTeams: Team[] = [];

  constructor(protected  nbaService: NbaService) {
    this.teams$ = nbaService.getAllTeams().pipe(
      tap(data => this.allTeams = data)
    );
  }

  trackTeam(teamId: string): void {
    let team = this.allTeams.find(team => team.id == Number(teamId));
    if (team)
      this.nbaService.addTrackedTeam(team);
  }
}
