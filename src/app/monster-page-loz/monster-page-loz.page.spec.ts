import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonsterPageLozPage } from './monster-page-loz.page';

describe('MonsterPageLozPage', () => {
  let component: MonsterPageLozPage;
  let fixture: ComponentFixture<MonsterPageLozPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MonsterPageLozPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
