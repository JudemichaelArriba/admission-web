import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamEvaluationPage } from './exam-evaluation-page';

describe('ExamEvaluationPage', () => {
  let component: ExamEvaluationPage;
  let fixture: ComponentFixture<ExamEvaluationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamEvaluationPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamEvaluationPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
