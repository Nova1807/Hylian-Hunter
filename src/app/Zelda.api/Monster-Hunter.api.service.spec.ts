import { TestBed } from '@angular/core/testing';

import { MonsterHunterApiService } from './Monster-Hunter.api.service';

describe('ApiService', () => {
  let service: MonsterHunterApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonsterHunterApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
