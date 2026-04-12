import { Component, EventEmitter, Input, OnInit, Output, inject, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamSchedule, EntranceExam } from '../../../models/entrance-exam.model';
import { SchedulesService } from '../../../services/schedules.service';
import { DialogService } from '../../../services/dialog.service';
import { DatePickerComponent } from '../../shared/date-picker/date-picker';
interface TimeState {
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
}

@Component({
  selector: 'app-schedule-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerComponent],
  templateUrl: './schedule-details-modal.html',
  styles: [`
    .hide-scroll::-webkit-scrollbar { display: none; }
    .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ScheduleDetailsModal implements OnInit {
  @Input({ required: true }) schedule!: ExamSchedule;
  
  @Output() close = new EventEmitter<void>();
  @Output() scheduleUpdated = new EventEmitter<ExamSchedule>();
  @Output() openAddStudent = new EventEmitter<ExamSchedule>();

  private schedulesService = inject(SchedulesService);
  private dialogService = inject(DialogService);
  private elementRef = inject(ElementRef);

  isSaving = signal(false);
  isEditing = signal(false);
  
  editData = signal<{
    room: string;
    exam_date: string; 
    status: 'upcoming' | 'completed';
  }>({ room: '', exam_date: '', status: 'upcoming' });


  hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  periods: ('AM' | 'PM')[] = ['AM', 'PM'];

  startTime: TimeState = { hour: '08', minute: '00', period: 'AM' };
  endTime: TimeState = { hour: '09', minute: '00', period: 'AM' };

  isStartTimeOpen = false;
  isEndTimeOpen = false;

  ngOnInit() {
    this.syncData();
  }


  private parseDateTime(datetime: string): { date: string, time: TimeState } {
    if (!datetime) return { date: '', time: { hour: '12', minute: '00', period: 'AM' } };
    
    const [datePart, timePart] = datetime.split(' ');
    const [h, m] = timePart.split(':');
    
    let hourNum = parseInt(h, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    
    if (hourNum === 0) hourNum = 12;
    if (hourNum > 12) hourNum -= 12;

    return {
      date: datePart,
      time: {
        hour: hourNum.toString().padStart(2, '0'),
        minute: m,
        period
      }
    };
  }

  private syncData() {
    const startParsed = this.parseDateTime(this.schedule.exam_date);
    const endParsed = this.parseDateTime(this.schedule.exam_end_time);

    this.editData.set({
      room: this.schedule.room,
      status: this.schedule.status,
      exam_date: startParsed.date
    });


    this.startTime = { ...startParsed.time };
    this.endTime = { ...endParsed.time };
  }

  toggleEdit() {
    this.isEditing.set(!this.isEditing());
    if (!this.isEditing()) {
      this.syncData(); 
    }
  }



  @HostListener('document:click')
  onClickOutside() {
    this.isStartTimeOpen = false;
    this.isEndTimeOpen = false;
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



  saveDetails() {
    const start24 = this.get24Hour(this.startTime);
    const end24 = this.get24Hour(this.endTime);

    const newExamDate = `${this.editData().exam_date} ${start24}:00`;
    const newExamEndTime = `${this.editData().exam_date} ${end24}:00`;

    if (
      this.editData().room === this.schedule.room &&
      this.editData().status === this.schedule.status &&
      newExamDate === this.schedule.exam_date &&
      newExamEndTime === this.schedule.exam_end_time
    ) {
      this.dialogService.alert('No Changes', 'No modifications were made to the schedule.');
      this.isEditing.set(false);
      return;
    }

    if (start24 >= end24) {
      this.dialogService.error('Invalid Time', 'The end time must be after the start time.');
      return;
    }

    this.dialogService.confirm('Update Schedule', 'Are you sure you want to save these changes?', () => {
      this.isSaving.set(true);
      
      const payload = {
        room: this.editData().room,
        status: this.editData().status,
        exam_date: newExamDate,
        exam_end_time: newExamEndTime,
      };

      this.schedulesService.updateSchedule(this.schedule.id, payload).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.isEditing.set(false); 
          
          const updated = { ...this.schedule, ...res.data, exams: this.schedule.exams };
          this.schedule = updated; 
          this.scheduleUpdated.emit(updated); 
          this.dialogService.success('Success', 'Schedule updated successfully.');
        },
        error: (err) => {
          console.error(err);
          this.isSaving.set(false);
          this.dialogService.error('Error', 'Failed to update schedule.');
        }
      });
    });
  }

  removeStudent(exam: EntranceExam) {
    this.dialogService.confirm(
      'Remove Student',
      `Remove ${exam.applicant?.first_name} ${exam.applicant?.last_name} from this schedule?`,
      () => {
        this.schedulesService.removeApplicant(this.schedule.id, exam.applicant_id).subscribe({
          next: () => {
            const updatedExams = this.schedule.exams?.filter(e => e.id !== exam.id) || [];
            const updatedSchedule = { ...this.schedule, exams: updatedExams };
            
            this.schedule = updatedSchedule; 
            this.scheduleUpdated.emit(updatedSchedule); 
            this.dialogService.success('Removed', 'Student removed from schedule.');
          },
          error: (err) => {
            console.error(err);
            this.dialogService.error('Error', 'Failed to remove student.');
          }
        });
      },
      undefined,
      'Remove',
      'Cancel'
    );
  }
}