import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-rules-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './rules-dialog.component.html',
  styleUrl: './rules-dialog.component.scss'
})
export class RulesDialogComponent {
  constructor(private dialogRef: MatDialogRef<RulesDialogComponent>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
