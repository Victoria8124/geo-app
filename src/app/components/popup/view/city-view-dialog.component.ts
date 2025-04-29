import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CityDetails } from '../../../interfaces/city-details.modul';

@Component({
  selector: 'app-city-view-dialog',
  imports: [MatDialogModule, CommonModule],
  templateUrl: './city-view-dialog.component.html',
  styleUrls: ['./city-view-dialog.component.scss'],
})
export class CityViewDialogComponent {
  cityDetails: CityDetails | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { cityDetails: { data: CityDetails } },
    private dialogRef: MatDialogRef<CityViewDialogComponent>,
  ) {
    this.cityDetails = data.cityDetails?.data || null;
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
