import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantsTabs } from './applicants-tabs';

describe('ApplicantsTabs', () => {
  let component: ApplicantsTabs;
  let fixture: ComponentFixture<ApplicantsTabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantsTabs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantsTabs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
