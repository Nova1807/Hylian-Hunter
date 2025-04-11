import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubpageMonsterHunterPage } from './Subpage-monster-hunter.page';

describe('Tab1Page', () => {
  let component: SubpageMonsterHunterPage;
  let fixture: ComponentFixture<SubpageMonsterHunterPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(SubpageMonsterHunterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
