import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantProfile } from './applicant-profile';

describe('ApplicantProfile', () => {
  let component: ApplicantProfile;
  let fixture: ComponentFixture<ApplicantProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
