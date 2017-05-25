import { Genre } from '../models/genre';

export class Movie extends Object {
    uuid: String;
    tmdb: TMDB;
};

export class TMDB extends Object {
    poster_path: string;
    genres: Genre[];
}