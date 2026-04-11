import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantsTable } from './applicants-table';

describe('ApplicantsTable', () => {
  let component: ApplicantsTable;
  let fixture: ComponentFixture<ApplicantsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
