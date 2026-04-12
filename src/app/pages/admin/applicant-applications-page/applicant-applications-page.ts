import { Component, OnInit, signal, inject, computed } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
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
export class ApplicantApplicationsPage implements OnInit {
  private readonly applicantService = inject(ApplicantService);
  private readonly documentService = inject(DocumentService);
  private readonly examsService = inject(ExamsService);
  private readonly dialogService = inject(DialogService);

  private allApplicants = signal<Applicant[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  activeFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('all');
  processingId = signal<number | null>(null);
  processingAction = signal<'approve' | 'reject' | null>(null);

  selectedApplicant = signal<Applicant | null>(null);
  isModalOpen = signal<boolean>(false);

  currentPage = signal(1);
  pageSize = signal(4); 

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

  totalPages = computed(() => {
    const total = this.filteredApplicants().length;
    return Math.ceil(total / this.pageSize()) || 1; 
  });

 
  paginatedApplicants = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredApplicants().slice(start, end);
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



  updateSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  setFilter(filter: 'all' | 'pending' | 'approved' | 'rejected') {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
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
    this.allApplicants.update(list =>
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