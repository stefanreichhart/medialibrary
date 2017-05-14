import { Component, OnInit } from '@angular/core';

import { AppService } from '../app.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {

  apiKeyTmdb: string;

  constructor(
    private appService: AppService,
  ) { }

  ngOnInit() {
    this.apiKeyTmdb = this.appService.apiKeyTmdb;
  }

  save() {
    this.appService.apiKeyTmdb = this.apiKeyTmdb;
  }

}
