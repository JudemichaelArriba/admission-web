import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamResultModal } from './exam-result-modal';

describe('ExamResultModal', () => {
  let component: ExamResultModal;
  let fixture: ComponentFixture<ExamResultModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamResultModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamResultModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
