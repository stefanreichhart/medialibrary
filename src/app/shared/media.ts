import { UuidService } from './uuid.service';

export enum Type {
    Movie
};

export class Media {

    uuid: string;
    title: string;
    type: Type;
    imdb: string;
    rating: number;

};