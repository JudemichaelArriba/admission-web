import { Component, Input } from '@angular/core';
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
  get isPending(): boolean {
    return this.applicant.status?.toLowerCase() === 'pending';
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
      case 'pending':
        return 'bg-slate-100 text-slate-500 ring-1 ring-slate-300/40';
      case 'rejected':
        return 'bg-red-100 text-red-700 ring-1 ring-red-300/40';
      default:
        return 'bg-slate-100 text-slate-400';
    }

  }
}