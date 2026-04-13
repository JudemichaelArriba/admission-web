import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SchedulesService } from '../../../services/schedules.service';
import { ExamSchedule, EntranceExam } from '../../../models/entrance-exam.model';
import { ScheduleTable } from '../../../components/admin/schedule-table/schedule-table';
import { ScheduleAddModal } from '../../../components/admin/schedule-add-modal/schedule-add-modal';
import { ScheduleAddStudentModal } from '../../../components/admin/schedule-add-student-modal/schedule-add-student-modal';
import { ScheduleDetailsModal } from '../../../components/admin/schedule-details-modal/schedule-details-modal'; 
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-exam-scheduler-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleTable, ScheduleAddModal, ScheduleAddStudentModal, ScheduleDetailsModal],
  templateUrl: './exam-scheduler-page.html',
})
export class ExamSchedulerPage implements OnInit, OnDestroy {
  private readonly schedulesService = inject(SchedulesService);
  private readonly dialogService = inject(DialogService);
  
  paginatedSchedules = signal<ExamSchedule[]>([]);
  isLoading = signal(true);
  
  // Search & Filter State
  searchTerm = signal('');
  activeFilter = signal<'all' | 'upcoming' | 'completed'>('all');
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;
  
  // Modal State
  isAddModalOpen = signal(false);
  selectedScheduleForStudents = signal<ExamSchedule | null>(null);
  selectedScheduleDetails = signal<ExamSchedule | null>(null); 
  deletingIds = signal<Set<number>>(new Set());

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10); 
  totalPages = signal(1);
  totalRecords = signal(0);

  ngOnInit() {
    this.loadSchedules();

    // Debounce search input to prevent API spam
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.currentPage.set(1);
      this.loadSchedules();
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadSchedules() {
    this.isLoading.set(true);
    this.schedulesService.getSchedules(
      this.currentPage(),
      this.pageSize(),
      this.searchTerm(),
      this.activeFilter()
    ).subscribe({
      next: (res) => {
        this.paginatedSchedules.set(res.data);
        this.currentPage.set(res.current_page);
        this.totalPages.set(res.last_page);
        this.totalRecords.set(res.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load schedules', err);
        this.isLoading.set(false);
      }
    });
  }

  // Pushes the input event into the RxJS Subject for debouncing
  updateSearch(term: string) {
    this.searchSubject.next(term);
  }

  setFilter(filter: 'all' | 'upcoming' | 'completed') {
    this.activeFilter.set(filter);
    this.currentPage.set(1); 
    this.loadSchedules();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadSchedules();
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadSchedules();
    }
  }

  handleScheduleAdded(newSchedule: ExamSchedule) {
    this.isAddModalOpen.set(false);
    this.currentPage.set(1); // Jump to page 1 to see the new schedule
    this.loadSchedules(); // Refetch to maintain exact pageSize limit
  }

  openManageStudentsModal(schedule: ExamSchedule) {
    this.selectedScheduleForStudents.set(schedule);
  }

  openScheduleDetails(schedule: ExamSchedule) {
    this.selectedScheduleDetails.set(schedule);
  }

  handleScheduleUpdated(updatedSchedule: ExamSchedule) {
    // Local patch is fine here, no need to reload the page for text edits
    this.paginatedSchedules.update(schedules => 
      schedules.map(schedule => schedule.id === updatedSchedule.id ? updatedSchedule : schedule)
    );
  }

  handleStudentsAdded(scheduleId: number, newExams: EntranceExam[]) {
    this.paginatedSchedules.update(schedules => 
      schedules.map(schedule => {
        if (schedule.id === scheduleId) {
          const updatedSchedule = {
            ...schedule,
            exams: [...(schedule.exams || []), ...newExams]
          };
          
          if (this.selectedScheduleDetails()?.id === scheduleId) {
            this.selectedScheduleDetails.set(updatedSchedule);
          }
          
          return updatedSchedule;
        }
        return schedule;
      })
    );
    this.selectedScheduleForStudents.set(null);
  }

  onDeleteSchedule(schedule: ExamSchedule) {
    this.dialogService.confirm(
      'Delete Schedule',
      `Are you sure you want to delete Schedule ID ${schedule.id} in ${schedule.room}? This will remove all assigned students.`,
      () => {
        this.deletingIds.update(set => {
          const newSet = new Set(set);
          newSet.add(schedule.id);
          return newSet;
        });

        this.schedulesService.deleteSchedule(schedule.id).subscribe({
          next: () => {
            this.deletingIds.update(set => {
              const newSet = new Set(set);
              newSet.delete(schedule.id);
              return newSet;
            });
            
            this.dialogService.success('Deleted', 'The schedule was successfully deleted.');
            
            // Reload from server to fill the empty row left by the deleted item
            this.loadSchedules(); 
          },
          error: (err) => {
            console.error(err);
            this.deletingIds.update(set => {
              const newSet = new Set(set);
              newSet.delete(schedule.id);
              return newSet;
            });
            this.dialogService.error('Delete Failed', 'Failed to delete the schedule. Please try again.');
          }
        });
      },
      undefined,
      'Delete',
      'Cancel'
    );
  }
}