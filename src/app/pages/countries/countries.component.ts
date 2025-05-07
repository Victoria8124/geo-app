import { CountriesApiService } from '../../services/countries.service';
import { CountryModel } from '../../interfaces/country.model';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  finalize,
  catchError,
} from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of, map, Observable } from 'rxjs';
import {TuiPagination} from '@taiga-ui/kit';
import {TuiTable} from '@taiga-ui/addon-table';
import {TuiInputModule} from '@taiga-ui/legacy';
import {TuiLoader} from '@taiga-ui/core';
import {TuiAlertService} from '@taiga-ui/core';

@Component({
  selector: 'app-countries',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatProgressSpinnerModule,
     TuiInputModule,
    TuiLoader,
    TuiPagination,
    TuiTable,
    FormsModule
  ],
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss'],
})

export class CountriesComponent implements OnInit {
  countries: CountryModel[] = [];
  displayedColumns: string[] = ['id', 'name', 'code', 'currency'];
  isLoading = false;
  totalItems = 0;
  pageSize = 5;
  searchControl = new FormControl('');

  private readonly alerts = inject(TuiAlertService);

  form: FormGroup;
  dataSource: any;
  pageIndex = 0;

  constructor(
    private countriesApiService: CountriesApiService,
    private router: Router,
  ) {
    this.form = new FormGroup({
      name: new FormControl(''),
      date: new FormControl(''),
      color: new FormControl(''),
      quantity: new FormControl(''),
      sum: new FormControl(''),
    });
  }

 ngOnInit(): void {
  this.fetchCountries(0, this.pageSize);

 /*подписываемся на изменения в инпуте*/
  this.searchControl.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query: string | null): Observable<CountryModel[]> => {
        this.isLoading = true;

        const safeQuery = query?.trim() || '';

        const result$: Observable<CountryModel[]> =
          safeQuery === ''
            ? this.countriesApiService.getCountries(0, this.pageSize).pipe(
                map((response) => {
                  this.totalItems = response.totalCount;
                  return response.data;
                })
              )
            : this.countriesApiService.searchCountries(safeQuery);

        return result$.pipe(
          catchError(() => {
             this.showError('Не удалось загрузить. Попробуйте снова.');
            return of([]);
          }),
          finalize(() => (this.isLoading = false))
        );
      })
    )
    .subscribe((countries: CountryModel[]) => {
      this.countries = countries;
    });
}

 /*запрос на страны*/
  fetchCountries(offset: number = 0, limit: number = this.pageSize): void {
    this.isLoading = true;
    this.countriesApiService.getCountries(offset, limit).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        this.countries = response.data;
        this.totalItems = response.totalCount;
      },
      error: () => {
       this.showError('Не удалось загрузить. Попробуйте снова.');
      }
    });
  }
  /*пагинатор*/
  onPageEvent(index: number): void {
  this.pageIndex = index;
  this.fetchCountries(index, this.pageSize);
  }

 /*переход на другую странцу*/
  goToCities(country: CountryModel) {
    this.router.navigate(['/cities'], {
      queryParams: {
        countryName: country.name,
        countryId: country.code,
      },
    });
  }

    /*внедряем ошибки*/
  private showError(message: string): void {
  this.alerts
    .open(message, {
      label: 'Ошибка',
      autoClose: 3000 
    })
    .subscribe();
  }
}

