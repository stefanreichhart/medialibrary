import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MediasComponent } from './medias/medias.component';
import { AppService } from './app.service';
import { UuidService } from './shared/uuid.service';
import { DefaultMediaService } from './shared/default-media.service';
import { MockMediaService } from './shared/mock-media.service';
import { MediaLookupService } from './shared/media-lookup.service';
import { MediaDetailsComponent } from './media-details/media-details.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { MediaAddComponent } from './media-add/media-add.component';
import { BackButtonComponent } from './back-button/back-button.component';
import { PreferencesComponent } from './preferences/preferences.component';

export const USE_MOCK_SERVICE: boolean = true;

@NgModule({
  declarations: [
    AppComponent,
    MediasComponent,
    MediaDetailsComponent,
    ToolbarComponent,
    MediaAddComponent,
    BackButtonComponent,
    PreferencesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    AppService,
    UuidService,
    { provide: DefaultMediaService, useClass: USE_MOCK_SERVICE ? MockMediaService : DefaultMediaService },
    MediaLookupService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
