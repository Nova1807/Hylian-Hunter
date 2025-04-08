import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeaponPageLozPage } from './weapon-page-loz.page';

describe('WeaponPageLozPage', () => {
  let component: WeaponPageLozPage;
  let fixture: ComponentFixture<WeaponPageLozPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WeaponPageLozPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
