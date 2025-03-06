import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

interface CityDetails {
  city: string;
  country: string;
  countryCode: string;
  elevationMeters: number;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  population: number;
  region: string;
  regionCode: string;
  regionWdId: string;
  timezone: string;
  type: string;
  wikiDataId: string;
}

@Component({
  selector: 'app-city-view-dialog',
  imports: [MatDialogModule, CommonModule],
  templateUrl: './city-view-dialog.component.html',
  styleUrls: ['./city-view-dialog.component.scss'],
})
export class CityViewDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { cityDetails: any  }, private dialogRef: MatDialogRef<CityViewDialogComponent>) {
    console.log('Data received in dialog:', data); // Проверка данных в модальном окне
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
