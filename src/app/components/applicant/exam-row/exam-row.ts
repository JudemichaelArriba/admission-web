import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ExamRow } from '../../../models/exam-row.model';

@Component({
  selector: '[app-exam-row]',
  standalone: true,
  imports: [NgClass, DatePipe],
  templateUrl: './exam-row.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamRowComponent {
  @Input({ required: true }) exam!: ExamRow;
  @Input({ required: true }) index!: number;
  @Output() viewResult = new EventEmitter<ExamRow>();

  @HostListener('click')
  onClick() {
    if (this.exam.status === 'evaluated') {
      this.viewResult.emit(this.exam);
    }
  }
}