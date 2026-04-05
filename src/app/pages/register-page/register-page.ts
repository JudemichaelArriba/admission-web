import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { DocumentService } from '../../services/document.service';
import { DialogService } from '../../services/dialog.service';
import { Course } from '../../models/course.model';
import { DatePickerComponent } from '../../components/shared/date-picker/date-picker';
import { DropdownComponent } from '../../components/shared/drop-down/drop-down';
import { DropdownOption } from '../../models/dropdown.model';



function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const confirm = group.get('password_confirmation')?.value;
  return pw && confirm && pw !== confirm ? { passwordMismatch: true } : null;
}

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const v = control.value ?? '';
  if (!v) return null;
  const hasLetter = /[a-zA-Z]/.test(v);
  const hasNumber = /[0-9]/.test(v);
  return hasLetter && hasNumber ? null : { passwordStrength: true };
}

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
    1: ['first_name', 'last_name', 'phone_number'],
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
        date_of_birth: [''],
        phone_number: ['', Validators.pattern(/^[0-9+\-\s]{7,20}$/)],
        address: ['', [Validators.required, Validators.maxLength(500)]],
        course_id: [null, Validators.required],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
        password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
        password_confirmation: ['', Validators.required],
        certify: [false, Validators.requiredTrue],
      },
      { validators: passwordMatchValidator },
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
        next: data => this.courses = data || [],
        error: () => this.dialog.error('Failed to load courses', 'Could not fetch available programs.'),
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
  }

  onFileSelected(event: Event): void {
    this.fileError = null;
    this.selectedFile = null;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!this.ALLOWED_MIME.includes(file.type)) {
      this.fileError = 'Only PNG, JPG, or PDF files are accepted.';
      return;
    }
    if (file.size > this.MAX_FILE_BYTES) {
      this.fileError = 'File must be 5 MB or smaller.';
      return;
    }
    this.selectedFile = file;
  }

  nextStep(): void {
    const fields = this.stepFields[this.currentStep] ?? [];
    fields.forEach(f => this.form.get(f)!.markAsTouched());
    const stepInvalid = fields.some(f => this.form.get(f)!.invalid);
    const mismatch = this.currentStep === 3 && this.form.hasError('passwordMismatch');
    if (stepInvalid || mismatch) return;
    if (this.currentStep < 4) this.currentStep++;
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    if (!this.selectedFile) {
      this.fileError = 'Please upload your Birth Certificate.';
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmitting = true;

    const v = this.form.value;
    const payload = {
      first_name: v.first_name.trim(),
      last_name: v.last_name.trim(),
      ...(v.middle_name?.trim() ? { middle_name: v.middle_name.trim() } : {}),
      ...(v.date_of_birth ? { date_of_birth: v.date_of_birth } : {}),
      ...(v.phone_number?.trim() ? { phone_number: v.phone_number.trim() } : {}),
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
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: () => {
        this.dialog.success(
          'Application Submitted!',
          'Your application has been received. You will be notified once it is reviewed.'
        );

      },
      error: err => {
        const body = err?.error;
        if (body?.errors) {
          const msgs: string[] = Object.values<string[]>(body.errors).flat();
          const fieldStepMap: Record<string, number> = {
            first_name: 1, last_name: 1, middle_name: 1, date_of_birth: 1, phone_number: 1,
            address: 2, course_id: 2,
            email: 3, password: 3, password_confirmation: 3,
          };
          const firstErrorField = Object.keys(body.errors)[0];
          const targetStep = fieldStepMap[firstErrorField];
          if (targetStep) this.currentStep = targetStep;
          this.dialog.error('Please check your details', msgs.join('\n'));
        } else if (err?.status === 409) {
          this.dialog.error('Already Registered', 'An account with this email already exists.');
        } else {
          this.dialog.error('Registration Failed', body?.message ?? 'Something went wrong.');
        }
      },
    });
  }

  f(name: string): AbstractControl { return this.form.get(name)!; }

  hasErr(name: string, error: string): boolean {
    const c = this.form.get(name)!;
    return c.touched && c.hasError(error);
  }

  get passwordMismatch(): boolean {
    return !!this.form.get('password_confirmation')?.touched && this.form.hasError('passwordMismatch');
  }
}