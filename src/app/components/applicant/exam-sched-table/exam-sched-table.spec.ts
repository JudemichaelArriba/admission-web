import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamSchedTable } from './exam-sched-table';

describe('ExamSchedTable', () => {
  let component: ExamSchedTable;
  let fixture: ComponentFixture<ExamSchedTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamSchedTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamSchedTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
