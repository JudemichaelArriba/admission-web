import { Component, OnInit, signal, inject, computed } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApplicantService } from "../../../services/applicants.service";
import { DocumentService } from "../../../services/document.service";
import { ExamsService } from "../../../services/exams.service";
import { DialogService } from "../../../services/dialog.service";
import { ApplicantsTable } from "../../../components/admin/applicants-table/applicants-table";
import { Applicant } from '../../../models/applicant.model';

@Component({
  selector: 'app-applicant-applications-page',
  standalone: true,
  imports: [CommonModule, ApplicantsTable, FormsModule],
  templateUrl: './applicant-applications-page.html'
})
export class ApplicantApplicationsPage implements OnInit {
  private readonly applicantService = inject(ApplicantService);
  private readonly documentService = inject(DocumentService);
  private readonly examsService = inject(ExamsService);
  private readonly dialogService = inject(DialogService);

  private allApplicants = signal<Applicant[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  activeFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('all');

  filteredApplicants = computed(() => {
    let list = this.allApplicants();
    const search = this.searchTerm().toLowerCase().trim();
    const filter = this.activeFilter().toLowerCase();

    if (filter !== 'all') {
      list = list.filter(a => a.status?.toLowerCase() === filter);
    }

    if (search) {
      list = list.filter(a =>
        a.first_name.toLowerCase().includes(search) ||
        a.last_name.toLowerCase().includes(search) ||
        a.id.toString().includes(search)
      );
    }

    return list;
  });

  ngOnInit() {
    this.loadApplicants();
  }

  loadApplicants() {
    this.isLoading.set(true);
    this.applicantService.getApplicants().subscribe({
      next: (res) => {
        this.allApplicants.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  setFilter(filter: 'all' | 'pending' | 'approved' | 'rejected') {
    this.activeFilter.set(filter);
  }

  onApprove(applicant: Applicant) {
    forkJoin({
      docs: this.documentService.list(applicant.id),
      exams: this.examsService.getExamsByApplicant(applicant.id)
    }).subscribe({
      next: ({ docs, exams }) => {
        if (!docs.length) {
          this.dialogService.error(
            'Cannot Approve',
            'No documents have been uploaded for this applicant yet.'
          );
          return;
        }

        const hasEvaluatedExam = exams.some(
          e => e.status === 'evaluated' && e.exam_score != null
        );

        if (!hasEvaluatedExam) {
          this.dialogService.error(
            'Cannot Approve',
            'The entrance exam has not been evaluated or scored yet.'
          );
          return;
        }

        this.dialogService.confirm(
          'Approve Applicant',
          `Approve ${applicant.first_name} ${applicant.last_name}? A student record will be created.`,
          () => this.executeApprove(applicant),
          undefined,
          'Approve',
          'Cancel'
        );
      },
      error: () => {
        this.dialogService.error(
          'Verification Failed',
          'Could not verify applicant records. Please try again.'
        );
      }
    });
  }

  onReject(applicant: Applicant) {
    this.dialogService.confirm(
      'Reject Applicant',
      `Reject ${applicant.first_name} ${applicant.last_name}? This action cannot be undone.`,
      () => this.executeReject(applicant),
      undefined,
      'Reject',
      'Cancel'
    );
  }

  private executeApprove(applicant: Applicant) {
    this.applicantService.updateStatus(applicant.id, 'approve').subscribe({
      next: (res) => {
        this.patchApplicant(res.applicant);
        this.dialogService.success(
          'Applicant Approved',
          `${applicant.first_name} ${applicant.last_name} has been approved and a student record has been created.`
        );
      },
      error: (err) => {
        this.dialogService.error(
          'Approval Failed',
          err?.error?.message ?? 'Something went wrong. Please try again.'
        );
      }
    });
  }

  private executeReject(applicant: Applicant) {
    this.applicantService.updateStatus(applicant.id, 'reject').subscribe({
      next: (res) => {
        this.patchApplicant(res.applicant);
        this.dialogService.success(
          'Applicant Rejected',
          `${applicant.first_name} ${applicant.last_name} has been rejected.`
        );
      },
      error: (err) => {
        this.dialogService.error(
          'Rejection Failed',
          err?.error?.message ?? 'Something went wrong. Please try again.'
        );
      }
    });
  }

  private patchApplicant(updated: Applicant) {
    this.allApplicants.update(list =>
      list.map(a => a.id === updated.id ? { ...a, ...updated } : a)
    );
  }
}