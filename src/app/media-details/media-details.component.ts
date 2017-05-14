import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

import { Media } from '../shared/media';
import { DefaultMediaService } from '../shared/default-media.service';
import { MediaLookupService } from '../shared/media-lookup.service';

@Component({
  selector: 'app-media-details',
  templateUrl: './media-details.component.html',
  styleUrls: ['./media-details.component.css']
})
export class MediaDetailsComponent implements OnInit {

  private media: Media;
  private genres: string[];

  constructor(
    private route: ActivatedRoute,
    private mediaService: DefaultMediaService,
    private mediaLookupService: MediaLookupService
  ) { 
    this.genres = [];
  }

  // TODO: fix this temporary solution
  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.mediaService.getMediaByUuid(params['uuid']))
      .subscribe(media => { 
        this.media = media;
        this.mediaLookupService.getGenres(media)
          .then(genres => { 
            this.genres = genres.map(genre => genre.name);
          });
      });
  }

}
