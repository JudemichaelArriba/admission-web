import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ExamsService } from '../../../services/exams.service';
import { EntranceExam } from '../../../models/entrance-exam.model';
import { ExamTable } from '../../../components/admin/exam-table/exam-table';
import { ExamEvaluateModal } from '../../../components/admin/exam-evaluate-modal/exam-evaluate-modal';

@Component({
  selector: 'app-exam-evaluation-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ExamTable, ExamEvaluateModal],
  templateUrl: './exam-evaluation-page.html',
})
export class ExamEvaluationPage implements OnInit, OnDestroy {
  private examsService = inject(ExamsService);

  paginatedExams = signal<EntranceExam[]>([]);
  isLoading = signal(true);
  selectedExamForEvaluation = signal<EntranceExam | null>(null);

  // Search & Filter State
  searchTerm = signal('');
  activeFilter = signal<'all' | 'ungraded' | 'graded'>('all');
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  // Pagination & Header Counts
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);
  totalRecords = signal(0);
  pendingCount = signal(0);
  evaluatedCount = signal(0);

  ngOnInit() {
    this.loadQueue();

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.currentPage.set(1);
      this.loadQueue();
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadQueue() {
    this.isLoading.set(true);
    this.examsService.getEvaluationQueue(
      this.currentPage(),
      this.pageSize(),
      this.searchTerm(),
      this.activeFilter()
    ).subscribe({
      next: (res) => {
        // Map the custom payload
        this.paginatedExams.set(res.exams.data);
        this.currentPage.set(res.exams.current_page);
        this.totalPages.set(res.exams.last_page);
        this.totalRecords.set(res.exams.total);
        
        // Update header widgets
        this.pendingCount.set(res.pending_count);
        this.evaluatedCount.set(res.evaluated_count);
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch queue', err);
        this.isLoading.set(false);
      }
    });
  }

  updateSearch(term: string) {
    this.searchSubject.next(term);
  }

  setFilter(filter: 'all' | 'ungraded' | 'graded') {
    this.activeFilter.set(filter);
    this.currentPage.set(1); 
    this.loadQueue();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadQueue();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadQueue();
    }
  }

  handleAction(exam: EntranceExam) {
    this.selectedExamForEvaluation.set(exam);
  }

  handleExamEvaluated(updatedExam: EntranceExam) {
    // We patch locally so the UI updates instantly
    this.paginatedExams.update(exams =>
      exams.map(e => e.id === updatedExam.id ? updatedExam : e)
    );
    
    // Decrease pending, increase evaluated
    this.pendingCount.update(c => Math.max(0, c - 1));
    this.evaluatedCount.update(c => c + 1);
    
    this.selectedExamForEvaluation.set(null); 
  }
}