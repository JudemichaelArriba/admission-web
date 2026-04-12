import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamSchedule } from '../../../models/entrance-exam.model';

@Component({
  selector: '[app-schedule-row]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-row.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleRow {
  @Input({ required: true }) schedule!: ExamSchedule;
  @Input() isDeleting = false;


  @Output() manage = new EventEmitter<ExamSchedule>();
  @Output() viewDetails = new EventEmitter<ExamSchedule>();

  @Output() delete = new EventEmitter<ExamSchedule>();

  @HostListener('click')
  onRowClick() {
    // Prevent opening details if the row is currently being deleted
    if (!this.isDeleting) {
      this.viewDetails.emit(this.schedule);
    }
  }
  // Helper properties to safely convert Laravel's date strings into JS Dates
  get normalizedDate(): Date | null {
    if (!this.schedule.exam_date) return null;
    return new Date(this.schedule.exam_date.replace(' ', 'T'));
  }

  get normalizedEndTime(): Date | null {
    if (!this.schedule.exam_end_time) return null;
    return new Date(this.schedule.exam_end_time.replace(' ', 'T'));
  }
}