import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamsService } from '../../../services/exams.service';
import { EntranceExam } from '../../../models/entrance-exam.model';
import { ExamTable } from '../../../components/admin/exam-table/exam-table';

@Component({
  selector: 'app-exam-evaluation-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ExamTable],
  templateUrl: './exam-evaluation-page.html',
})
export class ExamEvaluationPage implements OnInit {
  private examsService = inject(ExamsService);

  allExams = signal<EntranceExam[]>([]);
  isLoading = signal(true);
  
  searchTerm = signal('');
  activeFilter = signal<'all' | 'ungraded' | 'graded'>('all');

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

  setFilter(filter: 'all' | 'ungraded' | 'graded') {
    this.activeFilter.set(filter);
  }

  handleAction(exam: EntranceExam) {
  }
}