import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { GameBackgroundComponent } from '../../features/background/background.component';

@Component({
  selector: 'app-email-confirm',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    MatButtonModule,
    MatProgressSpinnerModule,
    GameBackgroundComponent
  ],
  templateUrl: './email-confirm.component.html',
  styleUrl: './email-confirm.component.scss'
})
export class EmailConfirmComponent implements OnInit, AfterViewInit {
  confirmForm: FormGroup;
  loading: boolean = false;
  currentEmail: string | null;
  codeDigits: string[] = ['', '', '', '', '', ''];
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.currentEmail = params['email'];
    })
    this.initConfirmForm();
  }

  ngAfterViewInit(): void {
    this.digitInputs.first.nativeElement.focus();
  }

  initConfirmForm() {
    this.confirmForm = this.fb.group({
      "code": ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
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
    this.confirmForm.controls['code'].setValue(code);
    this.confirmForm.controls['code'].markAsTouched();
    this.confirmForm.controls['code'].updateValueAndValidity();
  }

  getCodeControl() {
    return this.confirmForm.get('code');
  }

  onSubmit() {
    this.loading = true;
    this.authService.confrimEmail({
      "email": this.currentEmail,
      "code": this.confirmForm.value.code
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