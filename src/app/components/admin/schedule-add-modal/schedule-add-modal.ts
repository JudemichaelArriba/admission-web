import { Component, EventEmitter, Output, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '../../shared/date-picker/date-picker';
import { SchedulesService } from '../../../services/schedules.service';
import { DialogService } from '../../../services/dialog.service';
import { ExamSchedule } from '../../../models/entrance-exam.model';

interface TimeState {
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
}

@Component({
  selector: 'app-schedule-add-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerComponent],
  templateUrl: './schedule-add-modal.html',
  styles: [`
    .hide-scroll::-webkit-scrollbar { display: none; }
    .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ScheduleAddModal {
  private readonly schedulesService = inject(SchedulesService);
  private readonly dialog = inject(DialogService);
  private readonly elementRef = inject(ElementRef);

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ExamSchedule>();

  isSubmitting = signal(false);
  isClosing = signal(false);

  form = {
    exam_date: '',
    room: ''
  };

  hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  periods: ('AM' | 'PM')[] = ['AM', 'PM'];

  startTime: TimeState = { hour: '08', minute: '00', period: 'AM' };
  endTime: TimeState = { hour: '09', minute: '00', period: 'AM' };

  isStartTimeOpen = false;
  isEndTimeOpen = false;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isStartTimeOpen = false;
      this.isEndTimeOpen = false;
    }
  }

  toggleDropdown(type: 'start' | 'end', event: Event) {
    event.stopPropagation();
    if (type === 'start') {
      this.isStartTimeOpen = !this.isStartTimeOpen;
      this.isEndTimeOpen = false;
    } else {
      this.isEndTimeOpen = !this.isEndTimeOpen;
      this.isStartTimeOpen = false;
    }
  }

  onPanelClick(event: Event) {
    event.stopPropagation();
  }

  getDisplayTime(t: TimeState): string {
    return `${t.hour}:${t.minute} ${t.period}`;
  }

  get24Hour(t: TimeState): string {
    let h = parseInt(t.hour, 10);
    if (t.period === 'PM' && h < 12) h += 12;
    if (t.period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${t.minute}`;
  }

  closeModal() {
    if (this.isSubmitting()) return;
    this.isClosing.set(true);
    setTimeout(() => {
      this.isClosing.set(false);
      this.close.emit();
    }, 250);
  }

  onSubmit() {
    if (!this.form.exam_date || !this.form.room) {
      this.dialog.error('Missing Fields', 'Please fill in all required fields before saving.');
      return;
    }

    const start24 = this.get24Hour(this.startTime);
    const end24 = this.get24Hour(this.endTime);

    if (start24 >= end24) {
      this.dialog.error('Invalid Time', 'The end time must be after the start time.');
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      exam_date: `${this.form.exam_date} ${start24}:00`,
      exam_end_time: `${this.form.exam_date} ${end24}:00`,
      room: this.form.room,
      status: 'upcoming' as const
    };

    this.schedulesService.createSchedule(payload).subscribe({
      next: (res) => {
        this.dialog.success('Success', 'Exam schedule has been created successfully.');

        const completeScheduleData = { ...payload, ...(res?.data || {}) };
        this.saved.emit(completeScheduleData as ExamSchedule);
        
        this.isSubmitting.set(false);
        this.closeModal(); 
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'Could not save schedule.';
        this.dialog.error('Create Failed', msg);
      }
    });
  }
}