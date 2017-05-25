import { Component, OnInit } from '@angular/core';

import { Movie } from '../models/movie';
import { MediaService } from '../media-service/media.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit {

  private movies: Movie[];

  constructor(
    private appService: AppService,
    private mediaService: MediaService
  ) { }

  ngOnInit() {
    this.mediaService.getMovies().subscribe(movies => this.movies = movies);
  }

}
