import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { Media, Type } from './media';
import { UuidService } from './uuid.service';
import { AppService } from '../app.service';

@Injectable()
export class MediaLookupService {

  constructor(
    private http: Http,
    private appService: AppService,
    private uuidService: UuidService
  ) { }

  searchMovies(searchText: string): Promise<Media[]> {
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${this.appService.apiKeyTmdb}&query=${searchText}`;
    return this.request(url, 'results')
      .then(results => {
        let medias = [];
        results.forEach(each => {
          let media = this.createMediaFromTmdb(each);
          if (media) {
            medias.push(media);
          }
        });
        return Promise.resolve(medias);
      });
  }

  searchGenres(language : string = 'en'): Promise<any[]> {
    let url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${this.appService.apiKeyTmdb}&language=${language}`;
    return this.request(url, 'genres');
  }

  getGenres(media: Media, language: string = 'en'): Promise<any[]> {
    return this.searchGenres(language)
      .then(results => {
        return results.filter(each => media && media.genres && media.genres.indexOf(each.id) >= 0)
      });
  }

  private request(url: string, key: string): Promise<any[]> {
    let localStorageResponse = this.loadResponseFromLocalStorage(url);
    console.log(url);
    console.log(localStorageResponse);
    return (localStorageResponse ? this.localRequest(localStorageResponse, key) : this.remoteRequest(url, key));
  }

  private localRequest(response: string, key: string): Promise<any[]> {
    let json = JSON.parse(response);
    let result = json ? json[key] : [];
    return Promise.resolve(result ? result : []);
  }

  private remoteRequest(url: string, key: string): Promise<Media[]> {
    return this.http.get(url)
        .toPromise()
        .then(response => { 
          let body = JSON.stringify(response.json());
          this.saveResponseToLocalStorage(url, body);
          return this.localRequest(body, key);
        })
        .catch(this.handleError);
  }

  // TODO: fix this temporary solution
  private loadResponseFromLocalStorage(url: string): string {
    return localStorage.getItem(url);
  }

  // TODO: fix this temporary solution
  private saveResponseToLocalStorage(url: string, response: string): void {
    localStorage.setItem(url, response);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  createMediaFromTmdb(json: any): Media {
    if (json) {
      let media = new Media(this.uuidService.generate());
      media.title = json.title;
      media.description = json.overview;
      media.type = Type.Movie;
      media.poster = json.poster_path;
      media.released = new Date(json.release_date);
      media.originalTitle = json.original_title;
      media.originalLanguage = json.original_language;
      media.genres = json.genre_ids;
      return media;
    } else {
      return null;
    }
  }

}
