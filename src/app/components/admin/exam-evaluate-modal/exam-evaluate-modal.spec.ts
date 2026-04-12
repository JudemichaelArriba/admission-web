import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamEvaluateModal } from './exam-evaluate-modal';

describe('ExamEvaluateModal', () => {
  let component: ExamEvaluateModal;
  let fixture: ComponentFixture<ExamEvaluateModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamEvaluateModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamEvaluateModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
