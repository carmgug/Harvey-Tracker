import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TweetBoxComponent } from './tweet-box.component';

describe('TweetBoxComponent', () => {
  let component: TweetBoxComponent;
  let fixture: ComponentFixture<TweetBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TweetBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TweetBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
