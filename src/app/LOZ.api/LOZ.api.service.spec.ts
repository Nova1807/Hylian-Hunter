import { TestBed } from '@angular/core/testing';

import { LOZApiService } from './LOZ.api.service';

describe('ApiService', () => {
  let service: LOZApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LOZApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
