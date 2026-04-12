import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamRow } from '../../../models/exam-row.model';

@Component({
  selector: 'app-exam-result-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-result-modal.html',
})
export class ExamResultModal {
  @Input({ required: true }) exam!: ExamRow;
  @Output() close = new EventEmitter<void>();
}