import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(username: string, email: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    // Check minimum and maximum length
    if (value.length < 8) {
      return { minLength: true };
    }
    if (value.length > 32) {
      return { maxLength: true };
    }

    // Check for uppercase letters
    if (!/[A-Z]/.test(value)) {
      return { noUppercase: true };
    }

    // Check for lowercase letters
    if (!/[a-z]/.test(value)) {
      return { noLowercase: true };
    }

    // Check for numbers
    if (!/[0-9]/.test(value)) {
      return { noNumber: true };
    }

    // Check for special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      return { noSpecialChar: true };
    }

    // Check if password contains username or email
    if (username && value.toLowerCase().includes(username.toLowerCase())) {
      return { containsUsername: true };
    }
    if (email && value.toLowerCase().includes(email.toLowerCase())) {
      return { containsEmail: true };
    }

    return null;
  };
} 