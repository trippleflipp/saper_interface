import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { GameBackgroundComponent } from '../../features/background/background.component';
import { passwordValidator } from '../../core/validators/password.validator';
import { PasswordHintComponent } from "../../features/password-hint/password-hint.component";

@Component({
  selector: 'app-register',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    NgIf,
    GameBackgroundComponent,
    PasswordHintComponent
],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.initRegisterForm();
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = this.registerForm?.get('password')?.value;
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

  initRegisterForm(): void {
    this.registerForm = this.fb.group({
      "email": ['', [Validators.required, Validators.email]],
      "username": ['', [Validators.required]],
      "password": ['', [
        Validators.required,
        passwordValidator(
          this.registerForm?.get('username')?.value,
          this.registerForm?.get('email')?.value
        )
      ]],
      "confirmPassword": ['', [Validators.required, this.passwordMatchValidator.bind(this)]]
    })
  }
  
  submitRegister(): void {
    this.loading = true;
    const submitForm = new FormGroup({
      "username": this.registerForm.controls['username'],
      "password": this.registerForm.controls['password'],
      "email": this.registerForm.controls['email']
    })
    this.authService.register(submitForm.value).subscribe(
      () => {
        this.router.navigate(['/email_confirm'], {
          queryParams: { email: submitForm.value.email }
        });
      },
      (error) => {
        this.initRegisterForm();
        this.loading = false;
      }
    )
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
