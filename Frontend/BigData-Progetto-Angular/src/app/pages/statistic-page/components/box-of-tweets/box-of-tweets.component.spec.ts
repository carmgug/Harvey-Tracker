import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxOfTweetsComponent } from './box-of-tweets.component';

describe('BoxOfTweetsComponent', () => {
  let component: BoxOfTweetsComponent;
  let fixture: ComponentFixture<BoxOfTweetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoxOfTweetsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoxOfTweetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
