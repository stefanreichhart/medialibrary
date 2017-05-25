import { Injectable } from '@angular/core';
import { Location }  from '@angular/common';

@Injectable()
export class AppService {

  apiKeyTmdb: string;

  constructor(
    private location: Location
  ) { 
  }

  getTitle(): String {
    return 'Media Library';
  }

  goBack(): void {
    this.location.back();
  }

}
