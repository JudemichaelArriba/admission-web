import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Applicant } from '../../../models/applicant.model';

@Component({
  selector: '[app-applicants-row]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applicants-row.html'
})
export class ApplicantsRow {
  @Input({ required: true }) applicant!: Applicant;
  @Input() processingId: number | null = null;
  @Input() processingAction: 'approve' | 'reject' | null = null;
  @Output() approveClicked = new EventEmitter<Applicant>();
  @Output() rejectClicked = new EventEmitter<Applicant>();

  get isPending(): boolean {
    return this.applicant.status?.toLowerCase() === 'pending';
  }

  get isProcessing(): boolean {
    return this.processingId === this.applicant.id;
  }

  get isApproving(): boolean {
    return this.isProcessing && this.processingAction === 'approve';
  }

  get isRejecting(): boolean {
    return this.isProcessing && this.processingAction === 'reject';
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
      case 'pending':  return 'bg-slate-100 text-slate-500 ring-1 ring-slate-300/40';
      case 'rejected': return 'bg-red-100 text-red-700 ring-1 ring-red-300/40';
      default:         return 'bg-slate-100 text-slate-400';
    }
  }
}