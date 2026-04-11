import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantApplicationsPage } from './applicant-applications-page';

describe('ApplicantApplicationsPage', () => {
  let component: ApplicantApplicationsPage;
  let fixture: ComponentFixture<ApplicantApplicationsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantApplicationsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantApplicationsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
