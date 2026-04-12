import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntranceExam } from '../../../models/entrance-exam.model';

@Component({
  selector: '[app-exam-row]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-row.html',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class ExamRow {
  @Input({ required: true }) exam!: EntranceExam;
  @Output() actionClick = new EventEmitter<EntranceExam>();
}