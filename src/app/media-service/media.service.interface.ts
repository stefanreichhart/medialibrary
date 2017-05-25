import { Observable } from 'rxjs';

import { Movie } from '../models/movie';

export interface MediaServiceInterface {
    
    getMovies(): Observable<Movie[]>;

    getMovieByUuid(uuid: string): Observable<Movie>;

}
