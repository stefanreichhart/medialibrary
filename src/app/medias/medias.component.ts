import { Component, OnInit } from '@angular/core';

import { Media } from '../shared/media';
import { DefaultMediaService } from '../shared/default-media.service';

@Component({
  selector: 'app-medias',
  templateUrl: './medias.component.html',
  styleUrls: ['./medias.component.css']
})
export class MediasComponent implements OnInit {

  private title: string = 'Media Library';
  private medias: Media[];

  constructor(
    private mediaService: DefaultMediaService
  ) { }

  ngOnInit() {
    this.mediaService.getMedias().then(medias => this.medias = medias);
  }

}
