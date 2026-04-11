import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchedulesService } from '../../../services/schedules.service';
import { ExamSchedule } from '../../../models/entrance-exam.model';
import { ScheduleTable } from '../../../components/admin/schedule-table/schedule-table';
import { ScheduleAddModal } from '../../../components/admin/schedule-add-modal/schedule-add-modal';

@Component({
  selector: 'app-exam-scheduler-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleTable, ScheduleAddModal],
  templateUrl: './exam-scheduler-page.html',
})
export class ExamSchedulerPage implements OnInit {
  private readonly schedulesService = inject(SchedulesService);

  allSchedules = signal<ExamSchedule[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');
  activeFilter = signal<'all' | 'upcoming' | 'completed'>('all');
  isAddModalOpen = signal(false);
  
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

  setFilter(filter: 'all' | 'upcoming' | 'completed') {
    this.activeFilter.set(filter);
  }

  handleScheduleAdded(newSchedule: ExamSchedule) {
    this.allSchedules.update(list => [newSchedule, ...list]);
    this.isAddModalOpen.set(false);
  }
}