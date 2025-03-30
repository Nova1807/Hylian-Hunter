import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LOZPage } from './LOZ.page';

describe('Tab2Page', () => {
  let component: LOZPage;
  let fixture: ComponentFixture<LOZPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(LOZPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
