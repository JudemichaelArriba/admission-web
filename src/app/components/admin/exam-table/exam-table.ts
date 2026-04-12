import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntranceExam } from '../../../models/entrance-exam.model';
import { ExamRow } from '../exam-row/exam-row';

@Component({
  selector: 'app-exam-table',
  standalone: true,
  imports: [CommonModule, ExamRow],
  templateUrl: './exam-table.html',
})
export class ExamTable {
  @Input({ required: true }) exams: EntranceExam[] = [];
  @Input() isLoading = false;
  @Output() actionClick = new EventEmitter<EntranceExam>();
}