import { Injectable } from '@angular/core';

import { MediaService } from './media-service';
import { Media }      from './media';

@Injectable()
export class DefaultMediaService implements MediaService  {

  constructor() { }

  getMedias(): Promise<Media[]> {
    return Promise.resolve([]);
  }

  getMediaByUuid(uuid: string): Promise<Media> {
    return this.getMedias().then(medias => medias.find(media => media.uuid == uuid));
  }

}
