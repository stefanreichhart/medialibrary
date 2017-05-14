import { Component, OnInit } from '@angular/core';

import { Media } from '../shared/media';
import { AppService } from '../app.service';
import { MediaLookupService } from '../shared/media-lookup.service';
import { DefaultMediaService } from '../shared/default-media.service';

@Component({
  selector: 'app-media-add',
  templateUrl: './media-add.component.html',
  styleUrls: ['./media-add.component.css']
})
export class MediaAddComponent implements OnInit {

  private searchInput: string;
  private searchText: string;
  private medias: Media[];
  private selectedMedias: Media[];
  private error: any;

  constructor(
    private appService: AppService,
    private mediaService: DefaultMediaService,
    private mediaLookupService: MediaLookupService
  ) { }

  ngOnInit() {
    this.medias = [];
    this.selectedMedias = [];
  }

  doSearch(): void {
    let searchText = (this.searchInput || '').trim().replace(/ /g, '+');
    if (this.shouldSearch(searchText)) {
      this.searchText = searchText;
      this.mediaLookupService.searchMovies(searchText)
        .then(medias => this.medias = medias)
        .catch(error => this.error = error);
    } else {
      this.searchText = null;
    }
  }

  resetSearch(): void {
    this.searchInput = null;
    this.searchText = null;
  }

  private shouldSearch(searchText: string): boolean {
    return this.appService.apiKeyTmdb && searchText && searchText.trim() && this.searchText != searchText;
  }

  hasSearchInput(): boolean {
    return this.searchInput && this.searchInput.length > 0;
  }

  hasSearchText(): boolean {
    let searchText = (this.searchInput || '').trim();
    return this.shouldSearch(searchText);
  }

  toggleEntry(media: Media): void {
    let selectedMedia = this.selectedMedias.find(selected => selected === media);
    if (selectedMedia) {
      this.selectedMedias = this.selectedMedias.filter(selected => selected !== media);
    } else {
      this.selectedMedias.push(media);
    }
  }

  saveMedias(): void {
    this.mediaService.saveMedias(this.selectedMedias);
  }

}
