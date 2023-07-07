import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxTopTenHashtagDistComponent } from './box-top-ten-hashtag-dist.component';

describe('BoxTopTenHashtagDistComponent', () => {
  let component: BoxTopTenHashtagDistComponent;
  let fixture: ComponentFixture<BoxTopTenHashtagDistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoxTopTenHashtagDistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoxTopTenHashtagDistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
