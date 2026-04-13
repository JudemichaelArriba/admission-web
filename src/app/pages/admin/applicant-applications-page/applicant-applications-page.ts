import { Component, OnInit, OnDestroy, signal, inject } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ApplicantService } from "../../../services/applicants.service";
import { DocumentService } from "../../../services/document.service";
import { ExamsService } from "../../../services/exams.service";
import { DialogService } from "../../../services/dialog.service";
import { ApplicantsTable } from "../../../components/admin/applicants-table/applicants-table";
import { ApplicantsDetailsModal } from "../../../components/admin/applicants-details-modal/applicants-details-modal";
import { Applicant } from '../../../models/applicant.model';

@Component({
  selector: 'app-applicant-applications-page',
  standalone: true,
  imports: [CommonModule, ApplicantsTable, ApplicantsDetailsModal, FormsModule],
  templateUrl: './applicant-applications-page.html'
})
export class ApplicantApplicationsPage implements OnInit, OnDestroy {
  private readonly applicantService = inject(ApplicantService);
  private readonly documentService = inject(DocumentService);
  private readonly examsService = inject(ExamsService);
  private readonly dialogService = inject(DialogService);


  paginatedApplicants = signal<Applicant[]>([]);
  isLoading = signal(true);
  

  searchTerm = signal('');
  activeFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('all');

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  processingId = signal<number | null>(null);
  processingAction = signal<'approve' | 'reject' | null>(null);
  selectedApplicant = signal<Applicant | null>(null);
  isModalOpen = signal<boolean>(false);


  currentPage = signal(1);
  pageSize = signal(10); 
  totalPages = signal(1);
  totalRecords = signal(0);

  ngOnInit() {
    this.loadApplicants();

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.currentPage.set(1);
      this.loadApplicants();
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadApplicants() {
    this.isLoading.set(true);
    
    this.applicantService.getApplicants(
      this.currentPage(),
      this.pageSize(),
      this.searchTerm(),
      this.activeFilter()
    ).subscribe({
      next: (res) => {

        this.paginatedApplicants.set(res.data);
        this.currentPage.set(res.current_page);
        this.totalPages.set(res.last_page);
        this.totalRecords.set(res.total);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  updateSearch(term: string) {
    this.searchSubject.next(term);
  }

  setFilter(filter: 'all' | 'pending' | 'approved' | 'rejected') {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
    this.loadApplicants();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadApplicants();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadApplicants();
    }
  }

  openApplicantDetails(applicant: Applicant) {
    this.selectedApplicant.set(applicant);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedApplicant.set(null);
  }

  public handleApplicantUpdate(updatedApplicant: Applicant) {
    this.patchApplicant(updatedApplicant);
  }

  onApprove(applicant: Applicant) {
    this.processingId.set(applicant.id);
    this.processingAction.set('approve');

    forkJoin({
      docs: this.documentService.list(applicant.id),
      exams: this.examsService.getExams(applicant.id)
    }).subscribe({
      next: ({ docs, exams }) => {
        this.clearProcessing();

        if (!docs.length) {
          this.dialogService.error('Cannot Approve', 'No documents have been uploaded for this applicant yet.');
          return;
        }

        const hasEvaluatedExam = exams.some(e => e.status === 'evaluated' && e.exam_score != null);

        if (!hasEvaluatedExam) {
          this.dialogService.error('Cannot Approve', 'The entrance exam has not been evaluated or scored yet.');
          return;
        }

        this.dialogService.confirm(
          'Approve Applicant',
          `Approve ${applicant.first_name} ${applicant.last_name}? A student record will be created.`,
          () => {
            this.processingId.set(applicant.id);
            this.processingAction.set('approve');
            this.executeApprove(applicant);
          },
          undefined,
          'Approve',
          'Cancel'
        );
      },
      error: () => {
        this.clearProcessing();
        this.dialogService.error('Verification Failed', 'Could not verify applicant records. Please try again.');
      }
    });
  }

  onReject(applicant: Applicant) {
    this.dialogService.confirm(
      'Reject Applicant',
      `Reject ${applicant.first_name} ${applicant.last_name}? This action cannot be undone.`,
      () => {
        this.processingId.set(applicant.id);
        this.processingAction.set('reject');
        this.executeReject(applicant);
      },
      undefined,
      'Reject',
      'Cancel'
    );
  }

  private executeApprove(applicant: Applicant) {
    this.applicantService.updateStatus(applicant.id, 'approve').subscribe({
      next: (res) => {
        this.patchApplicant(res.applicant);
        this.clearProcessing();
        this.dialogService.success(
          'Applicant Approved',
          `${applicant.first_name} ${applicant.last_name} has been approved and a student record has been created.`
        );
      },
      error: (err) => {
        this.clearProcessing();
        this.dialogService.error('Approval Failed', err?.error?.message ?? 'Something went wrong. Please try again.');
      }
    });
  }

  private executeReject(applicant: Applicant) {
    this.applicantService.updateStatus(applicant.id, 'reject').subscribe({
      next: (res) => {
        this.patchApplicant(res.applicant);
        this.clearProcessing();
        this.dialogService.success(
          'Applicant Rejected',
          `${applicant.first_name} ${applicant.last_name} has been rejected.`
        );
      },
      error: (err) => {
        this.clearProcessing();
        this.dialogService.error('Rejection Failed', err?.error?.message ?? 'Something went wrong. Please try again.');
      }
    });
  }

  private patchApplicant(updated: Applicant) {
    this.paginatedApplicants.update(list =>
      list.map(a => a.id === updated.id ? { ...a, ...updated } : a)
    );
    if (this.selectedApplicant()?.id === updated.id) {
      this.selectedApplicant.set({ ...this.selectedApplicant()!, ...updated });
    }
  }

  private clearProcessing() {
    this.processingId.set(null);
    this.processingAction.set(null);
  }
}