import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntranceExam } from '../../../models/entrance-exam.model';
import { ExamsService } from '../../../services/exams.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-exam-evaluate-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-evaluate-modal.html',
})
export class ExamEvaluateModal implements OnInit {
  @Input({ required: true }) exam!: EntranceExam;
  
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<EntranceExam>();

  private examsService = inject(ExamsService);
  private dialogService = inject(DialogService);

  isSubmitting = signal(false);
  score = signal<number | null>(null);

  ngOnInit() { 
    if (this.exam.exam_score !== null && this.exam.exam_score !== undefined) {
      this.score.set(Number(this.exam.exam_score));
    }
  }

  onSubmit() {
    const currentScore = this.score();


    if (currentScore === null || currentScore === undefined || currentScore < 0 || currentScore > 100) {
      this.dialogService.error('Invalid Score', 'Please enter a valid numeric score between 0 and 100.');
      return;
    }


    const actionTxt = this.exam.exam_score === null ? 'submit' : 'update';
    this.dialogService.confirm(
      'Confirm Evaluation',
      `Are you sure you want to ${actionTxt} a score of ${currentScore} for ${this.exam.applicant?.first_name} ${this.exam.applicant?.last_name}?`,
      () => {
        
        this.isSubmitting.set(true);
        this.examsService.evaluateExam(this.exam.id, currentScore).subscribe({
          next: (res) => {
            this.isSubmitting.set(false);
            this.dialogService.success('Success', 'Exam evaluated successfully.');
            this.saved.emit(res.data);
          },
          error: (err) => {
            console.error(err);
            this.isSubmitting.set(false);
            this.dialogService.error('Error', err.error?.message || 'Failed to save the evaluation.');
          }
        });

      }
    );
  }
}