import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MediasComponent } from './medias/medias.component';
import { AppService } from './app.service';
import { DefaultMediaService } from './shared/default-media.service';
import { MockMediaService } from './shared/mock-media.service';
import { MediaDetailsComponent } from './media-details/media-details.component';

export const USE_MOCK_SERVICE: boolean = true;

@NgModule({
  declarations: [
    AppComponent,
    MediasComponent,
    MediaDetailsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    AppService,
    { provide: DefaultMediaService, useClass: USE_MOCK_SERVICE ? MockMediaService : DefaultMediaService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
