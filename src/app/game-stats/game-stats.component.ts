import {Component, OnDestroy, OnInit} from '@angular/core';
import {Team} from '../data.models';
import {Observable, Subscription, tap} from 'rxjs';
import {NbaService} from '../nba.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

export const CONFERENCE = {
  EMPTY: 'Choose a conference',
  WEST: 'West',
  EAST: 'East'
}

export const DIVISION = {
  EMPTY: 'Choose a division',
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

export const DIVISIONS_BY_CONFERENCE_MAP = new Map<string, string[]>([
  [CONFERENCE.WEST, [DIVISION.EMPTY, DIVISION.SOUTH_WEST, DIVISION.NORTH_WEST, DIVISION.PACIFIC]],
  [CONFERENCE.EAST, [DIVISION.EMPTY, DIVISION.CENTRAL, DIVISION.ATLANTIC, DIVISION.SOUTH_EAST]]
])

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
  readonly conferences = Object.values(CONFERENCE);
  readonly divisions = Object.values(DIVISION);
  filteredDivisions = Object.values(DIVISION);
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

    this.subscriptions.push(this.form.controls[this.CONFERENCE_FORM_KEY].valueChanges.pipe(
      tap(conference => {
        let selectedDivision = this.form.controls[this.DIVISION_FORM_KEY].value;
        if (conference != CONFERENCE.EMPTY) {
          if (!this.isDivisionCorrespondingToConference(conference, selectedDivision)) {
            this.setDivisionsByConference(conference);
            this.setFilteredTeamsByConference(conference);
          }
          if (!this.filteredDivisions.includes(selectedDivision)) {
            this.form.controls[this.DIVISION_FORM_KEY].setValue(DIVISION.EMPTY, {emitEvent: false});
          }
        } else {
          this.resetFilteredDivisions();
          if (selectedDivision == DIVISION.EMPTY) {
            this.resetFilteredTeams();
          } else {
            this.setFilteredTeamsByDivision(selectedDivision);
          }

        }
      })
    ).subscribe());

    this.subscriptions.push(this.form.controls[this.DIVISION_FORM_KEY].valueChanges.pipe(
      tap(division => {
        if (division != DIVISION.EMPTY) {
          this.setFilteredTeamsByDivision(division);
          this.setConferenceByDivision(division);
          this.setDivisionsByConference(this.form.controls[this.CONFERENCE_FORM_KEY].value);
        } else {
          let selectedConference = this.form.controls[this.CONFERENCE_FORM_KEY].value;
          if (selectedConference != CONFERENCE.EMPTY) {
            this.setFilteredTeamsByConference(selectedConference);
          } else {
            this.resetFilteredTeams();
          }
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

  private getConferenceByDivision(division: string): string | undefined {
    return division != DIVISION.EMPTY ? Array.from(DIVISIONS_BY_CONFERENCE_MAP.entries())
      .find(([_, divisions]) => divisions.includes(division))?.[0] : CONFERENCE.EMPTY;
  }

  private setFilteredTeamsByConference(conference: string): void {
    this.filteredTeams = this.allTeams.filter(team => team.conference == conference);
    this.setSelectedFilteredTeam();
  }

  private setFilteredTeamsByDivision(division: string): void {
    this.filteredTeams = this.allTeams.filter(team => team.division == division);
    this.setSelectedFilteredTeam();
  }

  private setSelectedFilteredTeam(): void {
    if (this.filteredTeams.length != 0) {
      this.form.controls[this.TEAM_FORM_KEY].setValue(this.filteredTeams[0]);
    } else {
      this.form.controls[this.TEAM_FORM_KEY].setValue(null);
    }
  }

  private isDivisionCorrespondingToConference(conference: string, division: string): boolean {
    return conference == this.getConferenceByDivision(division);
  }

  private setDivisionsByConference(conference: string): void {
    this.filteredDivisions = DIVISIONS_BY_CONFERENCE_MAP.get(conference)!;
  }

  private resetFilteredDivisions() {
    this.filteredDivisions = this.divisions;
  }

  private resetFilteredTeams(): void {
    this.filteredTeams = this.allTeams;
  }

  private setConferenceByDivision(division: string) {
    this.form.controls[this.CONFERENCE_FORM_KEY].setValue(this.getConferenceByDivision(division), {emitEvent: false});
  }

}
