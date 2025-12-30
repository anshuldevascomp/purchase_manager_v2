import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsndcondComponent } from './termsndcond.component';

describe('TermsndcondComponent', () => {
  let component: TermsndcondComponent;
  let fixture: ComponentFixture<TermsndcondComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TermsndcondComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsndcondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
