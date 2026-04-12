import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
export class ExamEvaluationPage implements OnInit {
  private examsService = inject(ExamsService);

  allExams = signal<EntranceExam[]>([]);
  isLoading = signal(true);
  selectedExamForEvaluation = signal<EntranceExam | null>(null);

  searchTerm = signal('');
  activeFilter = signal<'all' | 'ungraded' | 'graded'>('all');


  currentPage = signal(1);
  pageSize = signal(4); 

  pendingCount = computed(() => this.allExams().filter(e => e.exam_score === null).length);
  evaluatedCount = computed(() => this.allExams().filter(e => e.exam_score !== null).length);


  filteredExams = computed(() => {
    let list = this.allExams();
    const filter = this.activeFilter();
    const search = this.searchTerm().toLowerCase().trim();

    if (filter === 'ungraded') {
      list = list.filter(e => e.exam_score === null);
    } else if (filter === 'graded') {
      list = list.filter(e => e.exam_score !== null);
    }

    if (search) {
      list = list.filter(e =>
        e.id.toString().includes(search) ||
        `${e.applicant?.first_name} ${e.applicant?.last_name}`.toLowerCase().includes(search) ||
        e.schedule.room.toLowerCase().includes(search)
      );
    }

  
    return list.sort((a, b) => {
      const aVal = a.exam_score === null ? 0 : 1;
      const bVal = b.exam_score === null ? 0 : 1;
      return aVal - bVal;
    });
  });


  totalPages = computed(() => {
    const total = this.filteredExams().length;
    return Math.ceil(total / this.pageSize()) || 1; 
  });


  paginatedExams = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredExams().slice(start, end);
  });

  ngOnInit() {
    this.loadQueue();
  }

  loadQueue() {
    this.isLoading.set(true);
    this.examsService.getEvaluationQueue().subscribe({
      next: (data) => {
        this.allExams.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch queue', err);
        this.isLoading.set(false);
      }
    });
  }


  updateSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1); 
  }

  setFilter(filter: 'all' | 'ungraded' | 'graded') {
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

  handleAction(exam: EntranceExam) {
    this.selectedExamForEvaluation.set(exam);
  }

  handleExamEvaluated(updatedExam: EntranceExam) {
    this.allExams.update(exams =>
      exams.map(e => e.id === updatedExam.id ? updatedExam : e)
    );
    this.selectedExamForEvaluation.set(null); 
  }
}