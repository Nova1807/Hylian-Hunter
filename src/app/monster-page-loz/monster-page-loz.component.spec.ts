import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MonsterPageLOZComponent } from './monster-page-loz.component';

describe('MonsterPageLOZComponent', () => {
  let component: MonsterPageLOZComponent;
  let fixture: ComponentFixture<MonsterPageLOZComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MonsterPageLOZComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MonsterPageLOZComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
