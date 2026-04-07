import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ApplicantService } from '../../../services/applicants.service';
import { Applicant } from '../../../models/applicant.model';
import { ApplicantsCard } from '../applicants-card/applicants-card';
import { ApplicantRow } from '../../../models/applicant-row.model';

@Component({
  selector: 'app-status-table',
  standalone: true,
  imports: [CommonModule, ApplicantsCard],
  templateUrl: './status-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusTableComponent implements OnInit {
  private readonly applicantService = inject(ApplicantService);
  private readonly cdr = inject(ChangeDetectorRef);

  registrations: ApplicantRow[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadApplicantStatus();
  }

  private loadApplicantStatus(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.applicantService
      .getMe()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => {
          this.registrations = data ? [this.toRow(data)] : [];
        },
        error: (err) => {
          console.error('Failed to load application status', err);
          this.registrations = [];
          this.errorMessage = 'Unable to load your application status. Please try again.';
        }
      });
  }

  trackByApplicantId(index: number, item: ApplicantRow): number {
    return item.id ?? index;
  }

  private toRow(applicant: Applicant): ApplicantRow {
    return {
      id: applicant.id,
      first_name: applicant.first_name,
      last_name: applicant.last_name,
      email: applicant.email,
      status: applicant.status,
      course: applicant.course ? { course_name: applicant.course.course_name } : undefined,
    };
  }
}
