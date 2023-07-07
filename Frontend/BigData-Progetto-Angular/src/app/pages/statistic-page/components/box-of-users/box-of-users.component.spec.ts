import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxOfUsersComponent } from './box-of-users.component';

describe('BoxOfUsersComponent', () => {
  let component: BoxOfUsersComponent;
  let fixture: ComponentFixture<BoxOfUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoxOfUsersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoxOfUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
