import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(username: string, email: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;

    if (!password) {
      return null;
    }

    const errors: ValidationErrors = {};

    if (password.length < 8) {
      errors['minLength'] = true;
    }
    if (password.length > 32) {
      errors['maxLength'] = true;
    }

    if (!/[A-Z]/.test(password)) {
      errors['noUppercase'] = true;
    }

    if (!/[a-z]/.test(password)) {
      errors['noLowercase'] = true;
    }

    if (!/[0-9]/.test(password)) {
      errors['noNumber'] = true;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors['noSpecialChar'] = true;
    }

    const lowerCasePassword = password.toLowerCase();

    if (username && lowerCasePassword.includes(username.toLowerCase())) {
      errors['containsUsername'] = true;
    }
    if (email && lowerCasePassword.includes(email.toLowerCase())) {
      errors['containsEmail'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}