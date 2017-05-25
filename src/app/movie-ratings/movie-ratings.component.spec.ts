import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieRatingsComponent } from './movie-ratings.component';

describe('MovieRatingsComponent', () => {
  let component: MovieRatingsComponent;
  let fixture: ComponentFixture<MovieRatingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovieRatingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieRatingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
