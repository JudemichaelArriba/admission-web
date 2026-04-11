import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../../services/document.service';
import { ApplicantService } from '../../../services/applicants.service';
import { CourseService } from '../../../services/course.service';
import { DialogService } from '../../../services/dialog.service';
import { Applicant } from '../../../models/applicant.model';
import { ApplicantDocument } from '../../../models/applicant-document.model';
import { DropdownComponent } from '../../shared/drop-down/drop-down';
import { DropdownOption } from '../../../models/dropdown.model';
import { DatePickerComponent } from '../../shared/date-picker/date-picker';
@Component({
  selector: 'app-applicants-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent, DatePickerComponent],
  templateUrl: './applicants-details-modal.html',
  styleUrl: './applicants-details-modal.css',
})
export class ApplicantsDetailsModal implements OnInit {
  @Input({ required: true }) applicant!: Applicant;
  @Output() closeModal = new EventEmitter<void>();
  @Output() applicantUpdated = new EventEmitter<Applicant>();

  private readonly documentService = inject(DocumentService);
  private readonly applicantService = inject(ApplicantService);
  private readonly courseService = inject(CourseService);
  private readonly dialogService = inject(DialogService);

  documents = signal<ApplicantDocument[]>([]);
  isLoadingDocs = signal<boolean>(true);
  errorMessage = signal<string>('');

  // Edit State & Animation
  isClosing = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  courseOptions = signal<DropdownOption[]>([]);
  editForm: Partial<Applicant> = {};

  ngOnInit() {
    this.loadDocuments();
    this.loadCourses();
    this.initializeForm();
  }

  loadDocuments() {
    this.isLoadingDocs.set(true);
    this.documentService.list(this.applicant.id).subscribe({
      next: (docs) => {
        this.documents.set(docs || []);
        this.isLoadingDocs.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load applicant documents.');
        this.isLoadingDocs.set(false);
      }
    });
  }

  loadCourses() {
    this.courseService.getActiveCourses().subscribe({
      next: (courses) => {
        const options = courses.map(c => ({ label: c.course_name, value: c.id }));
        this.courseOptions.set(options);
      }
    });
  }

  initializeForm() {
    this.editForm = {
      first_name: this.applicant.first_name,
      last_name: this.applicant.last_name,
      middle_name: this.applicant.middle_name || '',
      phone_number: this.applicant.phone_number || '',
      date_of_birth: this.applicant.date_of_birth
        ? this.applicant.date_of_birth.split('T')[0]
        : '',
      address: this.applicant.address || '',
      course_id: this.applicant.course_id
    };
  }

  toggleEdit() {
    if (this.isEditing()) {
      this.initializeForm();
    }
    this.isEditing.set(!this.isEditing());
  }

  hasChanges(): boolean {
    return this.editForm.first_name !== this.applicant.first_name ||
      this.editForm.last_name !== this.applicant.last_name ||
      this.editForm.middle_name !== (this.applicant.middle_name || '') ||
      this.editForm.phone_number !== (this.applicant.phone_number || '') ||
      this.editForm.date_of_birth !== (this.applicant.date_of_birth || '') ||
      this.editForm.address !== (this.applicant.address || '') ||
      this.editForm.course_id !== this.applicant.course_id;
  }

  saveChanges() {
    if (!this.hasChanges()) {
      this.dialogService.alert('No Changes Detected', 'You have not made any modifications to the applicant details.');
      return;
    }

    this.dialogService.confirm(
      'Update Applicant',
      `Are you sure you want to save these changes for ${this.applicant.first_name}?`,
      () => {
        this.isSaving.set(true);
        this.applicantService.updateApplicant(this.applicant.id, this.editForm).subscribe({
          next: (updated) => {
            this.isSaving.set(false);
            this.isEditing.set(false);
            this.applicantUpdated.emit(updated);
            this.applicant = { ...this.applicant, ...updated }; 
            this.initializeForm(); 
            this.dialogService.success('Update Successful', 'Applicant details have been successfully updated.');
          },
          error: (err) => {
            this.isSaving.set(false);
            this.dialogService.error('Update Failed', err?.error?.message || 'Could not update applicant. Please try again.');
          }
        });
      },
      undefined,
      'Save Changes',
      'Cancel'
    );
  }

  triggerClose() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.closeModal.emit();
    }, 200); 
  }

  onCourseChange(courseId: number) {
    this.editForm.course_id = courseId;
  }

  openDocument(doc: ApplicantDocument) {
    if (doc.scan_status === 'infected') return;

    this.documentService.download(this.applicant.id, doc.id).subscribe({
      next: (res) => {
        const body = res.body;
        if (!body || body.byteLength === 0) {
          this.errorMessage.set('Document is empty.');
          return;
        }

        const mime = res.headers.get('Content-Type') || doc.mime_type || 'application/octet-stream';
        const blob = new Blob([body], { type: mime });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          URL.revokeObjectURL(url);
          link.remove();
        }, 100);
      },
      error: () => {
        this.errorMessage.set('Unable to open document securely.');
      }
    });
  }

  formatType(value: string): string {
    if (!value) return 'Unknown';
    return value.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  }

  formatBytes(bytes: number): string {
    if (!bytes && bytes !== 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[i]}`;
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  }
}