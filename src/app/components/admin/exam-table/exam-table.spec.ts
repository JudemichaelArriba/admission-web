import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamTable } from './exam-table';

describe('ExamTable', () => {
  let component: ExamTable;
  let fixture: ComponentFixture<ExamTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
