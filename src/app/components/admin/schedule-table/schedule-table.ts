import { Component, Input } from '@angular/core';
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
}