import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DialogService } from '../../services/dialog.service';
import { CustomValidators } from '../../utils/validators';

@Component({
  selector: 'app-forget-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forget-password-page.html',
  styleUrl: './forget-password-page.css',
})
export class ForgetPasswordPage {
  emailForm: FormGroup;
  resetForm: FormGroup;
  
  isSubmittingEmail = false;
  isSubmittingReset = false;
  isTokenSent = false;
  savedEmail = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialog: DialogService,
    private router: Router
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group(
      {
        token: ['', [Validators.required]],
      
        password: ['', [Validators.required, Validators.minLength(8), CustomValidators.passwordStrength]],
        password_confirmation: ['', [Validators.required]]
      },
      { validators: CustomValidators.passwordMatch }
    );
  }


  hasEmailErr(name: string, error: string): boolean {
    const ctrl = this.emailForm.get(name);
    return !!(ctrl?.touched && ctrl?.hasError(error));
  }

  hasResetErr(name: string, error: string): boolean {
    const ctrl = this.resetForm.get(name);
    return !!(ctrl?.touched && ctrl?.hasError(error));
  }

  get passwordMismatch(): boolean {
    return !!(this.resetForm.get('password_confirmation')?.touched && this.resetForm.hasError('passwordMismatch'));
  }

  onSendEmail() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.isSubmittingEmail = true;
    this.savedEmail = this.emailForm.value.email;

    this.authService.forgotPassword(this.savedEmail).subscribe({
      next: (res) => {
        this.isSubmittingEmail = false;
        this.isTokenSent = true;
        this.dialog.success('Token Sent', res.message);
      },
      error: (err) => {
        this.isSubmittingEmail = false;
        this.dialog.error('Error', err.error?.message || 'Failed to send reset token. Please try again.');
      }
    });
  }

  onResetPassword() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmittingReset = true;
    
    const payload = {
      email: this.savedEmail,
      token: this.resetForm.value.token,
      password: this.resetForm.value.password,
      password_confirmation: this.resetForm.value.password_confirmation
    };

    this.authService.resetPassword(payload).subscribe({
      next: (res) => {
        this.isSubmittingReset = false;
        this.dialog.success('Success', res.message);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmittingReset = false;
        this.dialog.error('Error', err.error?.message || 'Failed to reset password. Token may be invalid or expired.');
      }
    });
  }

  goBackToEmail() {
    this.isTokenSent = false;
    this.resetForm.reset();
  }
}