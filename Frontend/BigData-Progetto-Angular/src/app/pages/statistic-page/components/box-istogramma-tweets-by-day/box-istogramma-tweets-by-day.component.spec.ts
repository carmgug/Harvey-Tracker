import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxIstogrammaTweetsByDayComponent } from './box-istogramma-tweets-by-day.component';

describe('BoxIstogrammaTweetsByDayComponent', () => {
  let component: BoxIstogrammaTweetsByDayComponent;
  let fixture: ComponentFixture<BoxIstogrammaTweetsByDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoxIstogrammaTweetsByDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoxIstogrammaTweetsByDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
