import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { MoviePreview } from '../models/movie-preview';
import { AppService } from '../app.service';
import { MediaService } from '../media-service/media.service';
import { CompareService } from '../shared/compare.service';

@Component({
  selector: 'app-movie-add',
  templateUrl: './movie-add.component.html',
  styleUrls: ['./movie-add.component.css']
})
export class MovieAddComponent implements OnInit {

  private searchInput: string;
  private movies: MoviePreview[];
  private selectedMovies: MoviePreview[];
  private error: any;

  constructor(
    private route: ActivatedRoute,
    private appService: AppService,
    private mediaService: MediaService,
    private compareService: CompareService
  ) { }

  ngOnInit() {
    this.movies = [];
    this.selectedMovies = [];
    this.route.queryParams
      .map(params => this.searchOnInit(params['searchText']))
      .subscribe((any) => {}); // TODO
  }

  private searchOnInit(text: string) {
    this.searchInput = (text || '').trim().replace(/\+/g, ' ');
    this.search();
  }

  private search(): void {
    let searchText = (this.searchInput || '').trim().replace(/ /g, '+');
    if (this.shouldSearch(searchText)) {
      this.mediaService.searchMovies(searchText).subscribe((movies: MoviePreview[]) => this.movies = movies);
    }
  }

  private reset(): void {
    this.searchInput = null;
    this.movies = [];
  }

  private shouldSearch(searchText: string): boolean {
    return !!searchText && !!searchText.trim();
  }

  private hasSearchInput(): boolean {
    return this.searchInput && this.searchInput.length > 0;
  }

  private hasSearchText(): boolean {
    let searchText = (this.searchInput || '').trim();
    return this.shouldSearch(searchText);
  }

  private toggleSelection(movie: MoviePreview): void {
    let selectedMovie = this.selectedMovies.find(selected => selected === movie);
    if (selectedMovie) {
      this.selectedMovies = this.selectedMovies.filter(selected => selected !== movie);
    } else {
      this.selectedMovies.push(movie);
    }
  }

  private add(): void {
    this.mediaService.addMovies(this.selectedMovies);
  }

  private canAdd(movie: MoviePreview): boolean {
    return this.mediaService.containsMovie(movie);
  }

}
