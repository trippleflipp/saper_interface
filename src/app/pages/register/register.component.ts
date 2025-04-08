import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
    GameBackgroundComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword: boolean = true;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
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

  initRegisterForm(): void {
    this.registerForm = this.fb.group({
      "email": ['', [Validators.required, Validators.email]],
      "username": ['', [Validators.required]],
      "password": ['', [Validators.required, Validators.minLength(6)]],
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
