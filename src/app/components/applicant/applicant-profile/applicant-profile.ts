import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApplicantService } from '../../../services/applicants.service';
import { Applicant } from '../../../models/applicant.model';
import { DialogService } from '../../../services/dialog.service';
import { DatePickerComponent } from '../../shared/date-picker/date-picker';

@Component({
  selector: 'app-applicant-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePickerComponent],
  templateUrl: './applicant-profile.html'
})
export class ApplicantProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private applicantService = inject(ApplicantService);
  private dialog = inject(DialogService);

  profileForm!: FormGroup;
  applicantId!: number;

  isLoading = signal(true);
  isSaving = signal(false);
  isEditing = signal(false);

  private snapshot: Record<string, any> = {};
  readonly today = new Date().toISOString().split('T')[0];

  private readonly editableFields = ['first_name', 'last_name', 'middle_name', 'phone_number', 'date_of_birth', 'address'];

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  private initForm(): void {
    const locked = (val = '') => ({ value: val, disabled: true });
    this.profileForm = this.fb.group({
      first_name: [locked(), [Validators.required, Validators.maxLength(255)]],
      last_name: [locked(), [Validators.required, Validators.maxLength(255)]],
      middle_name: [locked(), [Validators.maxLength(255)]],
      email: [locked()],
      phone_number: [locked(), [Validators.pattern(/^[0-9+\-\s]{7,20}$/), Validators.maxLength(20)]],
      date_of_birth: [locked()],
      address: [locked()]
    });
  }

  private loadProfile(): void {
    this.applicantService.getMe().subscribe({
      next: (applicant: Applicant) => {
        this.applicantId = applicant.id;
        const values = {
          first_name: applicant.first_name ?? '',
          last_name: applicant.last_name ?? '',
          middle_name: applicant.middle_name ?? '',
          email: applicant.email ?? '',
          phone_number: applicant.phone_number ?? '',
          date_of_birth: applicant.date_of_birth ? applicant.date_of_birth.split('T')[0] : '',
          address: applicant.address ?? ''
        };
        this.profileForm.patchValue(values);
        this.snapshot = { ...values };
        this.isLoading.set(false);
      },
      error: () => {
        this.dialog.error('Error', 'Failed to load your profile. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  get dateValue(): string {
    return this.profileForm.get('date_of_birth')?.value ?? '';
  }

  onDateChange(date: string): void {
    this.profileForm.get('date_of_birth')?.setValue(date);
    this.profileForm.get('date_of_birth')?.markAsTouched();
  }

  startEditing(): void {
    this.editableFields.forEach(f => this.profileForm.get(f)?.enable());
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    if (this.hasChanges()) {
      this.dialog.confirm(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        () => this.revertAndClose(),
        undefined,
        'Discard',
        'Keep Editing'
      );
    } else {
      this.revertAndClose();
    }
  }

  private revertAndClose(): void {
    this.profileForm.patchValue(this.snapshot);
    this.profileForm.markAsPristine();
    this.editableFields.forEach(f => this.profileForm.get(f)?.disable());
    this.isEditing.set(false);
  }

  private hasChanges(): boolean {
    const current = this.profileForm.getRawValue();
    return Object.keys(this.snapshot).some(k => current[k] !== this.snapshot[k]);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.dialog.error('Validation Error', 'Please fix the highlighted errors before saving.');
      return;
    }

    if (!this.hasChanges()) {
      this.dialog.alert('No Changes', 'No changes were detected. Modify at least one field before saving.');
      return;
    }

    this.dialog.confirm(
      'Save Changes',
      'Are you sure you want to update your profile?',
      () => this.persistUpdate(),
      undefined,
      'Save',
      'Cancel'
    );
  }

  private persistUpdate(): void {
    this.isSaving.set(true);
    const raw = this.profileForm.getRawValue();
    const { email, ...payload } = raw;

    this.applicantService.updateApplicant(this.applicantId, payload).subscribe({
      next: () => {
        this.snapshot = { ...raw };
        this.isSaving.set(false);
        this.revertAndClose();
        this.dialog.success('Profile Updated', 'Your profile has been saved successfully.');
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err?.error?.message ?? 'Something went wrong. Please try again.';
        this.dialog.error('Update Failed', msg);
      }
    });
  }

  hasErr(field: string, error: string): boolean {
    const ctrl = this.profileForm.get(field);
    return !!(ctrl?.touched && ctrl?.hasError(error));
  }
}