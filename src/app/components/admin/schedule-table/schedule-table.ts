import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamSchedule } from '../../../models/entrance-exam.model';
import { ScheduleRow } from '../schedule-row/schedule-row';

@Component({
  selector: 'app-schedule-table',
  standalone: true,
  imports: [CommonModule, ScheduleRow],
  templateUrl: './schedule-table.html',
})
export class ScheduleTable {
  @Input({ required: true }) schedules: ExamSchedule[] = [];
  @Output() manageStudents = new EventEmitter<ExamSchedule>();
  @Output() viewDetails = new EventEmitter<ExamSchedule>();
  @Output() deleteSchedule = new EventEmitter<ExamSchedule>();
  @Input() deletingIds: Set<number> = new Set()
}