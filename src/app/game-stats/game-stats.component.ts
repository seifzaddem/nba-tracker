import {Component, OnDestroy, OnInit} from '@angular/core';
import {Team} from '../data.models';
import {combineLatestWith, Observable, startWith, Subscription, tap} from 'rxjs';
import {NbaService} from '../nba.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

export const CONFERENCE = {
  EMPTY: 'Choose...',
  WEST: 'West',
  EAST: 'East'
}

export const DIVISION = {
  EMPTY: 'Choose...',
  SOUTH_EAST: 'Southeast',
  SOUTH_WEST: 'Southwest',
  NORTH_WEST: 'Northwest',
  ATLANTIC: 'Atlantic',
  CENTRAL: 'Central',
  PACIFIC: 'Pacific'
}

export const DAYS = {
  SIX: 6,
  TWELVE: 12,
  TWENTY: 20
}

@Component({
  selector: 'app-game-stats',
  templateUrl: './game-stats.component.html',
  styleUrls: ['./game-stats.component.css']
})
export class GameStatsComponent implements OnInit, OnDestroy {

  form: FormGroup;
  allTeams$: Observable<Team[]>;
  allTeams: Team[] = [];
  filteredTeams: Team[] = [];
  subscriptions: Subscription[] = [];
  conferences = Object.values(CONFERENCE);
  readonly divisions = Object.values(DIVISION);
  readonly CONFERENCE_FORM_KEY = 'conference';
  readonly TEAM_FORM_KEY = 'team';
  readonly DIVISION_FORM_KEY = 'division'
  days = Object.values(DAYS);
  dayFormControl = new FormControl<number>(DAYS.TWELVE, {nonNullable: true});

  constructor(private nbaService: NbaService, private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      [this.CONFERENCE_FORM_KEY]: this.formBuilder.control(CONFERENCE.EMPTY),
      [this.TEAM_FORM_KEY]: this.formBuilder.control(null, Validators.required),
      [this.DIVISION_FORM_KEY]: this.formBuilder.control(DIVISION.EMPTY)
    });
    this.allTeams$ = this.nbaService.getAllTeams().pipe(
      tap(data => {
        this.allTeams = data;
        this.filteredTeams = data;
        if (data.length != 0) {
          this.form.controls[this.TEAM_FORM_KEY].setValue(data[0], {emitEvent: false});
        }
      })
    );

    this.subscriptions.push(
      this.form.controls[this.CONFERENCE_FORM_KEY].valueChanges.pipe(
        startWith(CONFERENCE.EMPTY),
        combineLatestWith(this.form.controls[this.DIVISION_FORM_KEY].valueChanges.pipe(startWith(DIVISION.EMPTY))),
        tap(([conference, division]) => {
          if (conference != CONFERENCE.EMPTY && division != DIVISION.EMPTY) {
            this.filteredTeams = this.allTeams.filter(team => team.conference == conference && team.division == division);
          } else if (conference == CONFERENCE.EMPTY && division != DIVISION.EMPTY) {
            this.filteredTeams = this.allTeams.filter(team => team.division == division);
          } else if (conference != CONFERENCE.EMPTY && division == DIVISION.EMPTY) {
            this.filteredTeams = this.allTeams.filter(team => team.conference == conference);
          } else {
            this.filteredTeams = this.allTeams;
          }

          if (this.filteredTeams.length != 0) {
            this.form.controls[this.TEAM_FORM_KEY].setValue(this.filteredTeams[0]);
          } else {
            this.form.controls[this.TEAM_FORM_KEY].setValue(null);
          }
        })
      ).subscribe());

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  trackTeam(): void {
    this.nbaService.addTrackedTeam(this.form.controls[this.TEAM_FORM_KEY].value);
  }

  getTrackedTeams(): Team[] {
    return this.nbaService.getTrackedTeams()
  }

}
