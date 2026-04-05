import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { DocumentService } from '../../services/document.service';
import { DialogService } from '../../services/dialog.service';
import { Course } from '../../models/course.model';
import { SignupPayload } from '../../models/auth.model';
import { DropdownOption } from '../../models/dropdown.model';
import { CustomValidators } from '../../utils/validators';
import { DatePickerComponent } from '../../components/shared/date-picker/date-picker';
import { DropdownComponent } from '../../components/shared/drop-down/drop-down';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    DatePickerComponent,
    DropdownComponent,
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage implements OnInit {
  currentStep = 1;
  courses: Course[] = [];
  isLoading = false;
  isSubmitting = false;

  selectedFile: File | null = null;
  fileError: string | null = null;
  readonly MAX_FILE_BYTES = 5 * 1024 * 1024;
  readonly ALLOWED_MIME = ['image/png', 'image/jpeg', 'application/pdf'];

  today = new Date().toISOString().split('T')[0];
  form: FormGroup;


  private readonly stepFields: Record<number, string[]> = {
    1: ['first_name', 'last_name', 'phone_number', 'date_of_birth'],
    2: ['address', 'course_id'],
    3: ['email', 'password', 'password_confirmation'],
  };

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private authService: AuthService,
    private documentService: DocumentService,
    private dialog: DialogService,
    private router: Router,
  ) {
    this.form = this.fb.group(
      {
        first_name: ['', [Validators.required, Validators.maxLength(100)]],
        last_name: ['', [Validators.required, Validators.maxLength(100)]],
        middle_name: ['', Validators.maxLength(100)],
        date_of_birth: ['', Validators.required],
        phone_number: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,20}$/)]],
        address: ['', [Validators.required, Validators.maxLength(500)]],
        course_id: [null, Validators.required],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
        password: ['', [Validators.required, Validators.minLength(8), CustomValidators.passwordStrength]],
        password_confirmation: ['', Validators.required],
        certify: [false, Validators.requiredTrue],
      },
      { validators: CustomValidators.passwordMatch },
    );
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getActiveCourses()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: data => (this.courses = data || []),
        error: () => this.dialog.error('Error', 'Could not fetch programs.'),
      });
  }

  get courseOptions(): DropdownOption[] {
    return this.courses.map(c => ({
      label: c.course_name,
      value: c.id,
      sublabel: c.course_code,
    }));
  }

  onCourseSelected(id: number): void {
    this.form.patchValue({ course_id: id });
    this.form.get('course_id')!.markAsTouched();
  }

  onDateChange(date: string): void {
    this.form.patchValue({ date_of_birth: date });
    this.form.get('date_of_birth')!.markAsTouched();
  }

  onFileSelected(event: Event): void {
    this.fileError = null;
    this.selectedFile = null;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!this.ALLOWED_MIME.includes(file.type)) {
      this.fileError = 'Invalid format. Use PNG, JPG, or PDF.';
      return;
    }
    if (file.size > this.MAX_FILE_BYTES) {
      this.fileError = 'File size exceeds 5MB.';
      return;
    }
    this.selectedFile = file;
  }

  nextStep(): void {
    const fields = this.stepFields[this.currentStep] ?? [];
    fields.forEach(f => {
      const ctrl = this.form.get(f);
      if (ctrl) ctrl.markAsTouched();
    });

    const isStepInvalid = fields.some(f => this.form.get(f)?.invalid);
    const hasMismatch = this.currentStep === 3 && this.form.hasError('passwordMismatch');

    if (isStepInvalid || hasMismatch) return;
    if (this.currentStep < 4) this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    if (!this.selectedFile) {
      this.fileError = 'Birth Certificate is required.';
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmitting = true;

    const v = this.form.value;
    const payload: SignupPayload = {
      first_name: v.first_name.trim(),
      last_name: v.last_name.trim(),
      middle_name: v.middle_name?.trim() || undefined,
      date_of_birth: v.date_of_birth,
      phone_number: v.phone_number?.trim() || undefined,
      address: v.address.trim(),
      course_id: Number(v.course_id),
      email: v.email.trim().toLowerCase(),
      password: v.password,
      password_confirmation: v.password_confirmation,
    };

    this.authService.signup(payload).pipe(
      switchMap(res => {
        const applicantId = res.applicant?.id ?? res.applicant_id ?? 0;
        return this.documentService.upload(applicantId, this.selectedFile!, 'birth_certificate');
      }),
      finalize(() => (this.isSubmitting = false))
    ).subscribe({
      next: () => {
        this.dialog.success('Success', 'Application submitted successfully!');
        this.router.navigate(['/login']);
      },
      error: err => this.handleRegistrationError(err)
    });
  }

  private handleRegistrationError(err: any): void {
    const errorBody = err?.error;
    if (errorBody?.errors) {
      const fieldStepMap: Record<string, number> = {
        first_name: 1, last_name: 1, middle_name: 1, date_of_birth: 1, phone_number: 1,
        address: 2, course_id: 2,
        email: 3, password: 3, password_confirmation: 3,
      };

      const firstField = Object.keys(errorBody.errors)[0];
      if (fieldStepMap[firstField]) this.currentStep = fieldStepMap[firstField];

      const messages = Object.values<string[]>(errorBody.errors).flat().join('\n');
      this.dialog.error('Validation Error', messages);
    } else {
      this.dialog.error('Error', errorBody?.message || 'Registration failed.');
    }
  }

  f(name: string): AbstractControl { return this.form.get(name)!; }

  hasErr(name: string, error: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl?.touched && ctrl?.hasError(error));
  }

  get passwordMismatch(): boolean {
    return !!(this.form.get('password_confirmation')?.touched && this.form.hasError('passwordMismatch'));
  }
}