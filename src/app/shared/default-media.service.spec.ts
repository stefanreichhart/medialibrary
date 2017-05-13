import { TestBed, inject } from '@angular/core/testing';

import { DefaultMediaService } from './default-media.service';

describe('MediaServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DefaultMediaService]
    });
  });

  it('should be created', inject([DefaultMediaService], (service: DefaultMediaService) => {
    expect(service).toBeTruthy();
  }));
});
