import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapsAppComponent } from './maps-app.component';

describe('MapsAppComponent', () => {
  let component: MapsAppComponent;
  let fixture: ComponentFixture<MapsAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapsAppComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapsAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
