import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {catchError, EMPTY, mergeMap, Subject, Subscription, tap} from 'rxjs';
import {NbaService} from '../nba.service';
import {Stats, Team} from '../data.models';

@Component({
  selector: 'app-team-stats',
  templateUrl: './team-stats.component.html',
  styleUrls: ['./team-stats.component.css']
})
export class TeamStatsComponent implements OnInit, OnDestroy, OnChanges {

  @Input()
  team!: Team;

  @Input()
  day!: number;

  stats!: Stats;
  games$: Subject<void> = new Subject<void>();
  subscriptions: Subscription[] = [];


  constructor(private nbaService: NbaService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['day']) {
      this.games$.next();
    }
  }

  ngOnInit(): void {
    this.subscriptions.push(this.games$.pipe(
      mergeMap(() => this.nbaService.getLastResults(this.team, this.day)),
      catchError(() => EMPTY),
      tap(games => this.stats = this.nbaService.getStatsFromGames(games, this.team))
    ).subscribe());

    this.games$.next();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  removeTrackedTeam(team: Team) {
    this.nbaService.removeTrackedTeam(team)
  }
}
