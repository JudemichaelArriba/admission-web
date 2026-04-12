import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamRow } from './exam-row';

describe('ExamRow', () => {
  let component: ExamRow;
  let fixture: ComponentFixture<ExamRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
