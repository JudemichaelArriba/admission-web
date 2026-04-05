import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
    static passwordMatch: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const password = control.get('password')?.value;
        const confirm = control.get('password_confirmation')?.value;
        return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
    };

    static passwordStrength: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const value = control.value ?? '';
        if (!value) return null;
        const hasLetter = /[a-zA-Z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        return hasLetter && hasNumber ? null : { passwordStrength: true };
    };
}