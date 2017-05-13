import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MediasComponent } from './medias/medias.component';
import { MediaDetailsComponent } from './media-details/media-details.component';

const routes: Routes = [
  { path: '', redirectTo: '/medias', pathMatch: 'full' },
  { path: 'medias',  component: MediasComponent },
  { path: 'media/:uuid',  component: MediaDetailsComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}