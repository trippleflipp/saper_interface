import { NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { GameBackgroundComponent } from '../../features/background/background.component';
import { passwordValidator } from '../../core/validators/password.validator';
import { PasswordHintComponent } from "../../features/password-hint/password-hint.component";

@Component({
  selector: 'app-forgot-password',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatInputModule,
    GameBackgroundComponent,
    PasswordHintComponent
],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  form: FormGroup;
  loading: boolean = false;
  currentEmail: string;
  codeSent: boolean = false;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  codeDigits: string[] = ['', '', '', '', '', ''];
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.initRequestForm();
  }

  initRequestForm() {
    this.form = this.fb.group({
      "email": ['', [Validators.required, Validators.email]]
    })
  }

  initResetForm() {
    this.form = this.fb.group({
      "code": ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      "password": ['', [
        Validators.required,
        passwordValidator('', this.currentEmail)
      ]],
      "confirmPassword": ['', [Validators.required, this.passwordMatchValidator.bind(this)]]
    })
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = this.form?.get('password')?.value;
    const confirmPassword = control.value;
    
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onDigitInput(index: number, event: any) {
    const input = event.target;
    const value = input.value;

    if (isNaN(value)) {
      input.value = '';
      this.codeDigits[index] = '';
    } else {
      this.codeDigits[index] = value;

      if (value && index < this.digitInputs.length - 1) {
        this.digitInputs.toArray()[index + 1].nativeElement.focus();
      }
    }

    this.updateCodeControl();
  }
  
  @HostListener('document:keydown.backspace', ['$event'])
  onBackspace(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement;
    if (target.value === '') {
      const index = Array.from(this.digitInputs.toArray()).findIndex(input => input.nativeElement === target);
      if (index > 0) {
        this.digitInputs.toArray()[index - 1].nativeElement.focus();
      }
    }
  }

  updateCodeControl() {
    const code = this.codeDigits.join('');
    this.form.controls['code'].setValue(code);
    this.form.controls['code'].markAsTouched();
    this.form.controls['code'].updateValueAndValidity();
  }

  getCodeControl() {
    return this.form.get('code');
  }

  submitCode() {
    this.loading = true;
    this.currentEmail = this.form.value.email
    this.authService.requestPasswordReset({
      "email": this.currentEmail
    }).subscribe(
      (res) => {
        this.loading = false;
        this.codeSent = true;
        this.initResetForm();
      },
      (error) => {
        this.loading = false;
        console.error(error);
      }
    )
  }

  submitPassword() {
    this.loading = true;
    this.authService.resetPassword({
      "email": this.currentEmail,
      "code": this.form.value.code,
      "new_password": this.form.value.password
    }).subscribe(
      (res) => {
        this.loading = false;
        this.authService.logout();
        this.router.navigate(['/login'])
      },
      (error) => {
        this.loading = false;
        console.error(error);
      }
    )
  }
}
