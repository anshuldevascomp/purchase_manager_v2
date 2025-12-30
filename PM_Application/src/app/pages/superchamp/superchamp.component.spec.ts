import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperchampComponent } from './superchamp.component';

describe('SuperchampComponent', () => {
  let component: SuperchampComponent;
  let fixture: ComponentFixture<SuperchampComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuperchampComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperchampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
