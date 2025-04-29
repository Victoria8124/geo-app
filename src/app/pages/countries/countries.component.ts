import { CountriesApiService } from '../../services/countries.service';
import { CountryModel } from '../../interfaces/country.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  finalize,
  catchError,
} from 'rxjs/operators';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of, map, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-countries',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    RouterModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss'],
})
export class CountriesComponent implements OnInit {
  countries: CountryModel[] = [];
  displayedColumns: string[] = ['id', 'name', 'code', 'currency'];
  dataSource = new MatTableDataSource<CountryModel>();
  isLoading: boolean = false;

  totalItems: number = 0;
  pageSize: number = 5;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchControl = new FormControl('');

  constructor(
    private countriesApiService: CountriesApiService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}
  ngOnInit() {
    this.fetchCountries(0, this.pageSize);

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          this.isLoading = true;

          let result$: Observable<CountryModel[]>;

          if (typeof query === 'string' && query.trim() === '') {
            result$ = this.countriesApiService
              .getCountries(0, this.pageSize)
              .pipe(
                map((response) => {
                  this.totalItems = response.totalCount;
                  return response.data;
                }),
              );
          } else if (typeof query === 'string' && query.length >= 2) {
            result$ = this.countriesApiService.searchCountries(query);
          } else {
            result$ = of([]);
          }

          return result$.pipe(
            catchError(() => {
              this.snackBar.open('Ошибка при поиске стран', 'Закрыть', {
                duration: 3000,
              });
              return of([]);
            }),
            finalize(() => (this.isLoading = false)),
          );
        }),
      )
      .subscribe((countries: CountryModel[]) => {
        this.countries = countries;
        this.dataSource.data = countries;
        if (this.paginator) {
          this.paginator.firstPage();
        }
      });
  }

  fetchCountries(offset: number = 0, limit: number = this.pageSize) {
    this.isLoading = true;

    this.countriesApiService
      .getCountries(offset, limit)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.countries = response.data;
          this.totalItems = response.totalCount;
          this.dataSource.data = this.countries;
        },
        error: () => {
          this.snackBar.open('Ошибка при загрузке списка стран', 'Закрыть', {
            duration: 3000,
          });
        },
      });
  }

  onPageEvent(event: PageEvent) {
    const offset = event.pageIndex * event.pageSize;
    this.pageSize = event.pageSize;
    this.fetchCountries(offset, event.pageSize);
  }

  goToCities(country: CountryModel) {
    this.router.navigate(['/cities'], {
      queryParams: {
        countryName: country.name,
        countryId: country.code,
      },
    });
  }
}
