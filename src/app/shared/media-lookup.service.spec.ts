import { TestBed, inject } from '@angular/core/testing';

import { MediaLookupService } from './media-lookup.service';

describe('MediaLookupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MediaLookupService]
    });
  });

  it('should be created', inject([MediaLookupService], (service: MediaLookupService) => {
    expect(service).toBeTruthy();
  }));
});
