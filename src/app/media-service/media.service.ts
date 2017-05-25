import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Movie } from '../models/movie';
import { MoviePreview } from '../models/movie-preview';
import { Genre } from '../models/genre';
import { MediaServiceInterface } from './media.service.interface';
import { ConvertService } from '../shared/convert.service';

@Injectable()
export class MediaService implements MediaServiceInterface {

  // TODO
  baseUrl: String = 'http://localhost:4100/api';

  constructor(
    private http: Http,
    private convert: ConvertService
  ) { }

  searchMovies(searchText: string): Observable<MoviePreview[]> {
    let url = `${this.baseUrl}/tmdb/movies/${this.convert.normalizeParameter(searchText)}`;
    return this.http
      .get(url).map((res:Response) => res.json().result);
  }

  addMovies(movies: MoviePreview[]): void {
    let url = `${this.baseUrl}/library/movies`;
    let ids = movies.map((movie: MoviePreview) => movie.id);
    this.http.put(url, ids).subscribe((response:Response) => console.log(response));
  }

  addMovie(movie: MoviePreview): void {
    let url = `${this.baseUrl}/library/movie/${movie.id}`;
    this.http.put(url, '').subscribe((response:Response) => console.log(response));
  }

  removeMovie(movie: Movie): void {
    let url = `${this.baseUrl}/library/movie/${movie.uuid}`;
    this.http.delete(url).subscribe((response:Response) => console.log(response));
  }

  // TODO (too expensive right now)
  containsMovie(movie: MoviePreview): boolean {
    let url = `${this.baseUrl}/library/movie/${movie.id}`;
    return false;
  }

  // TODO
  getMovies(): Observable<Movie[]> {
    let url = `${this.baseUrl}/library/movies`;
    return this.http
      .get(url).map((res:Response) => res.json().result);
  }

  // TODO
  getMovieByUuid(uuid: string): Observable<Movie> {
    let url = `${this.baseUrl}/library/movie/${uuid}`;
    return this.http.get(url)
      .map((res:Response) => res.json().result);
  }

  // 92, 154, 185, 300 500, original
  getPoster(url: string, width: string) {
    if (url) {
      let imageWidth = this.convert.asNumber(width, 92);
      return `http://image.tmdb.org/t/p/w${imageWidth}${url}`
    } else {
      return '';
    }
  }

}
