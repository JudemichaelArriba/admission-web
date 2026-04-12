import { Component, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicantService } from '../../../services/applicants.service';
import { SchedulesService } from '../../../services/schedules.service';
import { DialogService } from '../../../services/dialog.service'; 
import { Applicant } from '../../../models/applicant.model';
import { EntranceExam } from '../../../models/entrance-exam.model';

@Component({
  selector: 'app-schedule-add-student-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-add-student-modal.html'
})
export class ScheduleAddStudentModal implements OnInit {
  @Input({ required: true }) scheduleId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<EntranceExam[]>();

  private applicantService = inject(ApplicantService);
  private schedulesService = inject(SchedulesService);
  private dialogService = inject(DialogService);

  applicants = signal<Applicant[]>([]);
  selectedIds = signal<Set<number>>(new Set());
  isLoading = signal(true);
  isSaving = signal(false);

  allSelected = computed(() => {
    const total = this.applicants().length;
    return total > 0 && total === this.selectedIds().size;
  });

  ngOnInit() {
    this.fetchUnscheduled();
  }

  fetchUnscheduled() {
    this.applicantService.getUnscheduledApplicants().subscribe({
      next: (res) => {
        this.applicants.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  toggleAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.set(new Set(this.applicants().map(a => a.id)));
    } else {
      this.selectedIds.set(new Set());
    }
  }

  toggleSelection(id: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const newSet = new Set(this.selectedIds());
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    this.selectedIds.set(newSet);
  }

  save() {
    const count = this.selectedIds().size;

    if (count === 0) {
      this.dialogService.alert(
        'Selection Required', 
        'Please select at least one applicant to assign to this schedule.'
      );
      return;
    }

    this.dialogService.confirm(
      'Confirm Assignment',
      `Are you sure you want to assign ${count} student(s) to Schedule ID ${this.scheduleId}?`,
      () => this.executeSave()
    );
  }

  private executeSave() {
    this.isSaving.set(true);

    this.schedulesService.addApplicants(this.scheduleId, Array.from(this.selectedIds())).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.dialogService.success(
          'Success', 
          'Applicants have been successfully assigned to the schedule.',
          () => this.saved.emit(res.added)
        );
      },
      error: (err) => {
        console.error(err);
        this.isSaving.set(false);
        this.dialogService.error(
          'Assignment Failed', 
          'An error occurred while assigning the applicants. Please try again.'
        );
      }
    });
  }
}