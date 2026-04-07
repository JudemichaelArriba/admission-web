import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantsCard } from './applicants-card';

describe('ApplicantsCard', () => {
  let component: ApplicantsCard;
  let fixture: ComponentFixture<ApplicantsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantsCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantsCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
