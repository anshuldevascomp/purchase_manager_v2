import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewHotComponent } from './new-hot.component';

describe('NewHotComponent', () => {
  let component: NewHotComponent;
  let fixture: ComponentFixture<NewHotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewHotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewHotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
