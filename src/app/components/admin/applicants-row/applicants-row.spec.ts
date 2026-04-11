import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantsRow } from './applicants-row';

describe('ApplicantsRow', () => {
  let component: ApplicantsRow;
  let fixture: ComponentFixture<ApplicantsRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantsRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantsRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
