import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WeaponPageLOZComponent } from './weapon-page-loz.component';

describe('WeaponPageLOZComponent', () => {
  let component: WeaponPageLOZComponent;
  let fixture: ComponentFixture<WeaponPageLOZComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WeaponPageLOZComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WeaponPageLOZComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
