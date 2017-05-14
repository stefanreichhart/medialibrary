import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MediasComponent } from './medias/medias.component';
import { MediaDetailsComponent } from './media-details/media-details.component';
import { MediaAddComponent } from './media-add/media-add.component';
import { PreferencesComponent } from './preferences/preferences.component';

const routes: Routes = [
  { path: '', redirectTo: '/medias', pathMatch: 'full' },
  { path: 'medias',  component: MediasComponent },
  { path: 'medias/add',  component: MediaAddComponent },
  { path: 'media/:uuid',  component: MediaDetailsComponent },
  { path: 'preferences',  component: PreferencesComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}