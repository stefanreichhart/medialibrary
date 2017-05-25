import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-movie-ratings',
  templateUrl: './movie-ratings.component.html',
  styleUrls: ['./movie-ratings.component.css']
})
export class MovieRatingsComponent implements OnInit {

  @Input() popularity: number;
  @Input() voteAverage: number;
  @Input() voteCount: number; 

  constructor() { }

  ngOnInit() {
  }

}
