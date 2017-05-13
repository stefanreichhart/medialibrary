import { Injectable } from '@angular/core';

import { MediaService } from './media-service';
import { DefaultMediaService } from './default-media.service';
import { Media }      from './media';
import { MEDIAS }     from './mock-medias';

@Injectable()
export class MockMediaService extends DefaultMediaService implements MediaService {

  getMedias(): Promise<Media[]> {
    return Promise.resolve(MEDIAS);
  }

}
