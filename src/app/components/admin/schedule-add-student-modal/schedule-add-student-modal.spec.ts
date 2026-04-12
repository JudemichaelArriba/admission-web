import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleAddStudentModal } from './schedule-add-student-modal';

describe('ScheduleAddStudentModal', () => {
  let component: ScheduleAddStudentModal;
  let fixture: ComponentFixture<ScheduleAddStudentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleAddStudentModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleAddStudentModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
