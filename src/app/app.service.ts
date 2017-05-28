import { Injectable } from '@angular/core';
import { Location }  from '@angular/common';

@Injectable()
export class AppService {

  apiKeyTmdb: string;
  private sidebar: boolean = false;

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

  toggleSidebar(): void {
    this.sidebar = ! this.sidebar;
  }

  isSidebarVisible(): boolean {
    return !!this.sidebar;
  }

}
