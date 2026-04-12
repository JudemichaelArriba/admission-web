import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchedulesService } from '../../../services/schedules.service';
import { ExamSchedule } from '../../../models/entrance-exam.model';
import { ScheduleTable } from '../../../components/admin/schedule-table/schedule-table';
import { ScheduleAddModal } from '../../../components/admin/schedule-add-modal/schedule-add-modal';
import { ScheduleAddStudentModal } from '../../../components/admin/schedule-add-student-modal/schedule-add-student-modal';
import { ScheduleDetailsModal } from '../../../components/admin/schedule-details-modal/schedule-details-modal'; 
import { EntranceExam } from '../../../models/entrance-exam.model';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-exam-scheduler-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleTable, ScheduleAddModal, ScheduleAddStudentModal, ScheduleDetailsModal],
  templateUrl: './exam-scheduler-page.html',
})
export class ExamSchedulerPage implements OnInit {
  private readonly schedulesService = inject(SchedulesService);
  private readonly dialogService = inject(DialogService);
  
  allSchedules = signal<ExamSchedule[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  activeFilter = signal<'all' | 'upcoming' | 'completed'>('all');
  
  isAddModalOpen = signal(false);
  selectedScheduleForStudents = signal<ExamSchedule | null>(null);
  selectedScheduleDetails = signal<ExamSchedule | null>(null); 
  deletingIds = signal<Set<number>>(new Set());


  currentPage = signal(1);
  pageSize = signal(4); 

  filteredSchedules = computed(() => {
    let list = this.allSchedules();
    const search = this.searchTerm().toLowerCase().trim();
    const filter = this.activeFilter().toLowerCase();

    if (filter !== 'all') {
      list = list.filter(s => s.status?.toLowerCase() === filter);
    }
    if (search) {
      list = list.filter(s =>
        s.room?.toLowerCase().includes(search) ||
        s.exam_date?.includes(search) ||
        s.id?.toString().includes(search)
      );
    }

    return list;
  });


  totalPages = computed(() => {
    const total = this.filteredSchedules().length;
    return Math.ceil(total / this.pageSize()) || 1; 
  });


  paginatedSchedules = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredSchedules().slice(start, end);
  });

  ngOnInit() {
    this.loadSchedules();
  }

  loadSchedules() {
    this.isLoading.set(true);
    this.schedulesService.getSchedules().subscribe({
      next: (res) => {
        this.allSchedules.set(res); 
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load schedules', err);
        this.isLoading.set(false);
      }
    });
  }

 

  updateSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1); 
  }

  setFilter(filter: 'all' | 'upcoming' | 'completed') {
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

 

  handleScheduleAdded(newSchedule: ExamSchedule) {
    this.allSchedules.update(list => [newSchedule, ...list]);
    this.isAddModalOpen.set(false);
  }

  openManageStudentsModal(schedule: ExamSchedule) {
    this.selectedScheduleForStudents.set(schedule);
  }

  openScheduleDetails(schedule: ExamSchedule) {
    this.selectedScheduleDetails.set(schedule);
  }

  handleScheduleUpdated(updatedSchedule: ExamSchedule) {
    this.allSchedules.update(schedules => 
      schedules.map(schedule => schedule.id === updatedSchedule.id ? updatedSchedule : schedule)
    );
  }

  handleStudentsAdded(scheduleId: number, newExams: EntranceExam[]) {
    this.allSchedules.update(schedules => 
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
            this.allSchedules.update(list => list.filter(s => s.id !== schedule.id));
            
            this.deletingIds.update(set => {
              const newSet = new Set(set);
              newSet.delete(schedule.id);
              return newSet;
            });
            
            this.dialogService.success('Deleted', 'The schedule was successfully deleted.');
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