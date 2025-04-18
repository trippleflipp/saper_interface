import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../core/auth/auth.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf } from '@angular/common';
import { SnackbarData } from '../../interfaces/snackbardata.model';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DisableService } from '../../core/services/disable.service';
import { catchError, EMPTY, Observable, of, switchMap, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-disable-confirm',
  imports: [
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    NgIf
  ],
  templateUrl: './disable-confirm.component.html',
  styleUrl: './disable-confirm.component.scss'
})
export class DisableConfirmComponent implements OnInit {
  @Output() checkStatus = new EventEmitter<any>();
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DisableConfirmComponent>,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private disableService: DisableService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = this.fb.group({
      'otp': ['', [Validators.required]],
      'check': [false, [Validators.requiredTrue]]
    })
  }

  disable2fa(): void {
    this.check2faAndProceed().pipe(
      catchError(error => {
        console.error("Error during 2FA disable process:", error);
        return of(null);
      })
    ).subscribe();
  }

  private handleVerify2faSuccess(): Observable<any> {
    return this.authService.disable2fa().pipe(
      tap(disableResponse => {
        if (disableResponse.message === '2fa disabled') {
          this.openSnackbar("Отключено", "Аутентификация по Google Authenticator отключена", 5000);
          this.disableService.callFunction();
          this.closeDialog();
        } else {
          this.handleUnexpectedError();
        }
      })
    );
  }

  private verifyOtpAndDisable2fa(otp: string): Observable<any> {
    return this.authService.verify2fa({ 'otp': otp }).pipe(
      switchMap(verifyResponse => {
        if (verifyResponse.message === "Invalid Code") {
          this.handleInvalidCodeError();
          return EMPTY;
        }
        if (verifyResponse.message === "Success") {
          return this.handleVerify2faSuccess();
        }
        return throwError(() => "Unexpected verify response");
      })
    );
  }

  private check2faAndProceed(): Observable<any> {
    return this.authService.check2faStatus().pipe(
      switchMap(response => {
        if (response.message === 'enabled') {
          const otp = String(this.form.value.otp);
          return this.verifyOtpAndDisable2fa(otp);
        } else {
          this.handle2faNotEnabled();
          return EMPTY;
        }
      })
    );
  }  

  private handleInvalidCodeError(): void {
    this.openSnackbar("Ошибка", "Неверный код!", 3000);
    this.initForm();
  }

  private handle2faNotEnabled(): void {
    this.openSnackbar("Ошибка!", "Двухфакторная аутентификация не включена", 3000);
    this.closeDialog();
  }

  private handleUnexpectedError(): void {
    this.openSnackbar("Ошибка!", "Неизвестная ошибка", 3000);
    this.initForm();
  }
  
  closeDialog(): void {
    this.dialogRef.close();
  }

  private openSnackbar(title: string, message: string, duration: number): void {
    const data: SnackbarData = {
      title,
      message,
      duration,
      button: null
    };
    
    this.snackBar.openFromComponent(SnackbarComponent, {
      data,
      duration: undefined
    });
  }
}
