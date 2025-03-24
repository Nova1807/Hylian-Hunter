import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonsterHunterPage } from './Monster-Hunter.page';

describe('Tab1Page', () => {
  let component: MonsterHunterPage;
  let fixture: ComponentFixture<MonsterHunterPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(MonsterHunterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
