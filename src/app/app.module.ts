import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';

import { AppService } from './app.service';
import { MediaService } from './media-service/media.service';
import { ConvertService } from './shared/convert.service';
import { CompareService } from './shared/compare.service';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { BackButtonComponent } from './back-button/back-button.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { MoviesComponent } from './movies/movies.component';
import { MovieComponent } from './movie/movie.component';
import { RoundPipe } from './shared/pipes/round.pipe';
import { RuntimePipe } from './shared/pipes/runtime.pipe';
import { DurationPipe } from './shared/pipes/duration.pipe';
import { MovieAddComponent } from './movie-add/movie-add.component';
import { MovieRatingsComponent } from './movie-ratings/movie-ratings.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    BackButtonComponent,
    PreferencesComponent,
    MoviesComponent,
    MovieComponent,
    RoundPipe,
    RuntimePipe,
    DurationPipe,
    MovieAddComponent,
    MovieRatingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    AppService,
    MediaService,
    ConvertService,
    CompareService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
