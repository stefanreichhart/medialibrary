export enum Type {
    Movie
};

export class Media {

    uuid: string;
    title: string;
    description: string;
    type: Type;
    genres: string[];
    poster: string;
    released: Date;
    added: Date;
    originalTitle: string;
    originalLanguage: string;
    languages: string[];
    subtitles: string[];
    rating: number;
    imdb: string;

    constructor(uuid: string) {
        this.uuid = uuid;
        this.genres = [];
        this.added = new Date();
        this.languages = [];
        this.subtitles = [];
        this.rating = 0;
    }

    equals(media: Media): boolean {
        return this === media 
            || (this.uuid && media.uuid && this.uuid == media.uuid)
            || (this.imdb && media.imdb && this.imdb == media.imdb)
            || (this.title && media.title && this.title == media.title) 
            || (this.title && media.title && this.normalize(this.title) == this.normalize(media.title));
    }

    // TODO: fix this temporary solution
    private normalize(text: string): string {
        return (text || '').trim().toLowerCase().replace(/ /g, '');
    }

};