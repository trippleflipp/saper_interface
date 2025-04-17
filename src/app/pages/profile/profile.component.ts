import { Component, OnInit } from '@angular/core';
import { GameBackgroundComponent } from "../../features/background/background.component";
import { HeaderComponent } from "../../features/header/header.component";
import { AuthService } from '../../core/auth/auth.service';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SnackbarData } from '../../interfaces/snackbardata.model';
import { SnackbarComponent } from '../../features/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profile',
  imports: [
    GameBackgroundComponent, 
    HeaderComponent,
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  protected qrCodeData: string | null = null;
  auth2fa: boolean = false;
  is2faEnabled: boolean = false;

  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.check2faStatus();
  }

  initForm(): void {
    this.form = this.fb.group({
      "otp": ['', [Validators.required]]
    })
  }

  check2faStatus(): void {
    this.authService.check2faStatus().subscribe(
      (response) => {
        this.is2faEnabled = response.message == 'enabled';
      }
    );
  }

  enable2fa() {
    this.auth2fa = true;
    this.authService.generateQr().subscribe((res) => {
      if (res instanceof Blob) {
        this.blobToDataURL(res).then(dataUrl => {
          this.qrCodeData = dataUrl;
        });
      }
    })
  }

  private blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  disable2fa() {
    this.authService.disable2fa().subscribe(
      () => {
        this.openSnackbar("2FA отключен", "Двухфакторная аутентификация успешно отключена", 3000);
        this.check2faStatus();
      },
      (error) => {
        this.openSnackbar("Ошибка", "Не удалось отключить 2FA", 3000);
      }
    );
  }

  verify2fa() {
    const otp = String(this.form.value.otp)
    this.authService.verify2fa({
      'otp': otp
    }).subscribe((res) => {
      if (res.message == "Invalid Code") {
        this.openSnackbar("Ошибка", "Неверный код!", 3000);
        this.auth2fa = false;
        this.check2faStatus();
      }
      if (res.message == "Success") {
        this.openSnackbar("2fa Подключен!", "Теперь авторизация будет проходить через Google Authenticator!", 5000);
        this.auth2fa = false;
        this.check2faStatus();
      }
    })
  }

  get username() {
    return this.authService.getUsernameFromToken()
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
