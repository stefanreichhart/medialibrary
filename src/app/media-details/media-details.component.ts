import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

import { AppService } from '../app.service';
import { Media } from '../shared/media';
import { DefaultMediaService } from '../shared/default-media.service';

@Component({
  selector: 'app-media-details',
  templateUrl: './media-details.component.html',
  styleUrls: ['./media-details.component.css']
})
export class MediaDetailsComponent implements OnInit {

  private media: Media;

  constructor(
    private appService: AppService,
    private mediaService: DefaultMediaService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.mediaService.getMediaByUuid(params['uuid']))
      .subscribe(media => this.media = media);
  }

}
