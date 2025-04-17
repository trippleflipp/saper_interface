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

  disable2fa() {
    this.authService.check2faStatus().subscribe(
      (response) => {
        if (response.message == 'enabled') {
          const otp = String(this.form.value.otp)
          this.authService.verify2fa({
            'otp': otp
          }).subscribe((res) => {
            if (res.message == "Invalid Code") {
              this.openSnackbar("Ошибка", "Неверный код!", 3000);
              this.initForm();
              return;
            }
            if (res.message == "Success") {
              this.authService.disable2fa().subscribe((res) => {
                if (res.message == '2fa disabled') {
                  this.openSnackbar("Отключено", "Аутентификация по Google Authenticator отключена", 5000);
                  this.disableService.callFunction();
                  this.closeDialog();
                }
                else {
                  this.openSnackbar("Ошибка!", "Неизвестная ошибка", 3000);
                  this.initForm();
                }
              })
            }
          })
        }
        else {
          this.openSnackbar("Ошибка!", "Двухфакторная аутентификация не включена", 3000);
          this.closeDialog();
        }
      }
    );
    return
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
