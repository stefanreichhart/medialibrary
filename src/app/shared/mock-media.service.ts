import { Injectable } from '@angular/core';

import { MediaService } from './media-service';
import { DefaultMediaService } from './default-media.service';
import { Media } from '../shared/media';
import { MEDIAS } from './mock-medias';

@Injectable()
export class MockMediaService extends DefaultMediaService implements MediaService {

  // TODO: fix this temporary solution - server side
  getDefaultMedias(): Media[] {
    return this.convertMediasFromLocalStorage(MEDIAS);
  }

}
