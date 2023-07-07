import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopTrendsComponentComponent } from './top-trends-component.component';

describe('TopTrendsComponentComponent', () => {
  let component: TopTrendsComponentComponent;
  let fixture: ComponentFixture<TopTrendsComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopTrendsComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopTrendsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
