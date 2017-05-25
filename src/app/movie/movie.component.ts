import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

import { Movie } from '../models/movie';
import { MediaService } from '../media-service/media.service';
import { CompareService } from '../shared/compare.service';

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit {

  private movie: Movie;

  constructor(
    private route: ActivatedRoute,
    private mediaService: MediaService,
    private compareService: CompareService
  ) { }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.mediaService.getMovieByUuid(params['uuid']))
      .subscribe(movie => this.movie = movie);
  }

  private remove(): void {
    this.mediaService.removeMovie(this.movie);
    // TODO
  }

}
