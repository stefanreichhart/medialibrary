import { Injectable } from '@angular/core';

import { Media } from './media';
import { MediaService } from './media-service';
import { UuidService } from './uuid.service';

@Injectable()
export class DefaultMediaService implements MediaService  {
  
  private medias: Media[];

  constructor(
    protected uuidService: UuidService
  ) {
    this.medias = this.getMediasFromLocalStorage();
  }

  getMedias(): Promise<Media[]> {
    return Promise.resolve(this.medias);
  }

  getMediaByUuid(uuid: string): Promise<Media> {
    return this.getMedias().then(medias => medias.find(media => media.uuid == uuid));
  }

  getMediaUsingEquals(media: Media): Promise<Media> {
    return this.getMedias()
      .then(medias => medias.find(existingMedia => existingMedia.equals(media)));
  }

  // TODO: fix this temporary solution
  saveMedias(medias: Media[]): void {
    Promise
      .all(medias.map(newMedia => { 
        return this.getMediaUsingEquals(newMedia)
          .then(existingMedia => {
            if (!existingMedia) {
              return this.getMedias()
                .then(medias => { 
                  medias.push(newMedia); 
                  return Promise.resolve(newMedia); 
              });
            } else {
              return Promise.resolve(null);
            }
          });
        }))
      .then(values => this.setMediasToLocalStorage());
  }

  // TODO: fix this temporary solution
  private getMediasFromLocalStorage(): Media[] {
    let data = localStorage.getItem('medias');
    return data ? this.convertMediasFromLocalStorage(JSON.parse(data.trim())) : this.getDefaultMedias();
  }

  // TODO: fix this temporary solution
  protected convertMediasFromLocalStorage(rawMedias : any[]): Media[] {
    return rawMedias.map(rawMedia => {
      let media = new Media(rawMedia.uuid || this.uuidService.generate());
      Object.keys(rawMedia).forEach(key => {
        media[key] = rawMedia[key];
      });
      return media;
    });
  }

  // TODO: fix this temporary solution
  private setMediasToLocalStorage(): void {
    this.getMedias().then(medias => localStorage.setItem('medias', JSON.stringify(medias)));
  }

  getDefaultMedias(): Media[] {
    return [];
  }

}
