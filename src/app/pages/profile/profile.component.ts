import { Component, OnInit } from '@angular/core';
import { GameBackgroundComponent } from "../../features/background/background.component";
import { HeaderComponent } from "../../features/header/header.component";
import { AuthService } from '../../core/auth/auth.service';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SnackbarData } from '../../interfaces/snackbardata.model';
import { SnackbarComponent } from '../../features/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { DisableConfirmComponent } from '../../features/disable-confirm/disable-confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { DisableService } from '../../core/services/disable.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GameService } from '../../core/services/game.service';
import { map, Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

interface PersonalRecord {
  milliseconds: number;
  difficulty: string;
}

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
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  protected qrCodeData: string | null = null;
  auth2fa: boolean = false;
  is2faEnabled: boolean = false;
  enableButton: boolean = false;
  pending: boolean = false;
  records: PersonalRecord[] | null = null;

  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private disableService: DisableService,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.getPersonalRecords();
    this.initForm();
    this.check2faStatus();
  }

  initForm(): void {
    this.form = this.fb.group({
      "otp": ['', [Validators.required]]
    })
    this.disableService.functionCall$.subscribe(() => {
      this.check2faStatus();
    })
    this.pending = false;
  }

  getPersonalRecords(): void {
    this.gameService.get_personal_records().subscribe((res) => {
      if (res.length > 0) {
        this.records = res;
      }
    })
  }

  check2faStatus(): void {
    this.authService.check2faStatus().subscribe(
      (response) => {
        if (response.message == 'enabled') {
          this.is2faEnabled = true;
          this.enableButton = false;
        }
        else {
          this.is2faEnabled = false;
          this.enableButton = true;
        }
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
    this.dialog.open(DisableConfirmComponent, {
          width: '50vw',
          maxWidth: '90vw',
          maxHeight: '90vh'
    });
  }

  verify2fa() {
    this.pending = true;
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

  formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
}
