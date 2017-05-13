import { TestBed, inject } from '@angular/core/testing';

import { MockMediaService } from './mock-media.service';

describe('MediaServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockMediaService]
    });
  });

  it('should be created', inject([MockMediaService], (service: MockMediaService) => {
    expect(service).toBeTruthy();
  }));
});
