import { Component, Inject, Input } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarData } from '../../interfaces/snackbardata.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-snackbar',
  imports: [
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss'
})
export class SnackbarComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<SnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackbarData
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.closeSnackbar();
    }, this.data.duration);
  }

  closeSnackbar(): void {
    this.snackBarRef.dismiss();
  }
}
