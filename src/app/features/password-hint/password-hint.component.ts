import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-password-hint',
  imports: [
    MatFormFieldModule
  ],
  templateUrl: './password-hint.component.html',
  styleUrl: './password-hint.component.scss'
})
export class PasswordHintComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;
  allHintsValid: boolean;
  passwordChangeSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.passwordChangeSubscription = this.form.get('password')?.valueChanges.subscribe(() => {
      this.updateAllHintsValid();
    })
  }

  updateAllHintsValid(): void {
    if (!this.form || !this.form.get('password')) {
      this.allHintsValid = false;
      return;
    }

    const password = this.form.get('password')?.value;

    this.allHintsValid =
      (password?.length >= 8 && password?.length <= 32) &&
      this.hasUppercase(password) &&
      this.hasLowercase(password) &&
      this.hasNumber(password) &&
      this.hasSpecialChar(password) &&
      !this.form.controls['password'].errors?.['containsEmail'];
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
      const password = this.form?.get('password')?.value;
      const confirmPassword = control.value;
      
      if (password !== confirmPassword) {
        return { passwordMismatch: true };
      }
      return null;
  }
  
  hasUppercase(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  hasLowercase(password: string): boolean {
    return /[a-z]/.test(password);
  }

  hasNumber(password: string): boolean {
    return /[0-9]/.test(password);
  }

  hasSpecialChar(password: string): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  }

  ngOnDestroy(): void {
    this.passwordChangeSubscription?.unsubscribe();
  }
}
