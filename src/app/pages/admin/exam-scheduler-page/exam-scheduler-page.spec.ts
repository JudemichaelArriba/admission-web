import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamSchedulerPage } from './exam-scheduler-page';

describe('ExamSchedulerPage', () => {
  let component: ExamSchedulerPage;
  let fixture: ComponentFixture<ExamSchedulerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamSchedulerPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamSchedulerPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
