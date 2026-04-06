import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantsDashbaord } from './applicants-dashbaord';

describe('ApplicantsDashbaord', () => {
  let component: ApplicantsDashbaord;
  let fixture: ComponentFixture<ApplicantsDashbaord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantsDashbaord]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantsDashbaord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
