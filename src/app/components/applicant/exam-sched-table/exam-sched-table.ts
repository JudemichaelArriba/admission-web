import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ExamsService } from '../../../services/exams.service';
import { EntranceExam } from '../../../models/entrance-exam.model';
import { ExamRow } from '../../../models/exam-row.model';
import { ExamRowComponent } from '../exam-row/exam-row';

@Component({
  selector: 'app-exam-sched-table',
  standalone: true,
  imports: [CommonModule, ExamRowComponent],
  templateUrl: './exam-sched-table.html',
  styleUrl: './exam-sched-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamSchedTable implements OnInit {
  private readonly examsService = inject(ExamsService);
  private readonly cdr = inject(ChangeDetectorRef);

  exams: ExamRow[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadExams();
  }

  private loadExams(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.examsService.getMyExams()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          this.exams = (data ?? []).map((exam) => this.toRow(exam));
        },
        error: (err) => {
          console.error('Failed to load exam schedule', err);
          this.exams = [];
          this.errorMessage = 'Unable to load your exam schedule. Please try again.';
        }
      });
  }

  trackByExamId(index: number, item: ExamRow): number {
    return item.id ?? index;
  }

  private toRow(exam: EntranceExam): ExamRow {
    return {
      id: exam.id,
      examDate: this.toDate(exam.exam_date),
      examEndTime: this.toDate(exam.exam_end_time),
      room: exam.room ?? '',
      status: exam.status,
    };
  }

  private toDate(value?: string | null): Date | null {
    if (!value) return null;
    const normalized = value.replace(' ', 'T');

    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
