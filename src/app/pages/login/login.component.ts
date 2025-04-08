import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { GameBackgroundComponent } from '../../features/background/background.component';


@Component({
  selector: 'app-login',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgIf,
    GameBackgroundComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  loginForm: FormGroup;
  hidePassword: boolean = true;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initLoginForm();
  }

  initLoginForm(): void {
    this.loginForm = this.fb.group({
      "username": ['', [Validators.required]],
      "password": ['', [Validators.required, Validators.minLength(6)]]
    })
  }

  onForgotPassword(): void {
    this.router.navigate(['/forgot_password'])
  }

  redirectToRegister(): void {
    this.router.navigate(['/register'])
  }

  submitLogin(): void {
    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe(
      (res) => {
        this.authService.setToken(res.access_token);
        this.authService.navigate();
      },
      (error) => {
        this.initLoginForm();
        this.loading = false;
      }
    )
  }
}
