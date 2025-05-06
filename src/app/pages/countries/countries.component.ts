import { CountriesApiService } from '../../services/countries.service';
import { CountryModel } from '../../interfaces/country.model';
import { Component, OnInit, ViewChild } from '@angular/core';
// import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormGroup, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  finalize,
  catchError,
} from 'rxjs/operators';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatTableDataSource } from '@angular/material/table';
// import { PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of, map, Observable } from 'rxjs';
// import { MatSnackBar } from '@angular/material/snack-bar';
	import {TuiPagination} from '@taiga-ui/kit';
	import {TuiTable} from '@taiga-ui/addon-table';
  	import {TuiInputModule} from '@taiga-ui/legacy';
    	import {TuiLoader} from '@taiga-ui/core';
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
     TuiInputModule,
    TuiLoader,
    TuiPagination,
    TuiTable,
    FormsModule

  ],
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss'],
})
// export class CountriesComponent implements OnInit {
//   countries: CountryModel[] = [];
//   displayedColumns: string[] = ['id', 'name', 'code', 'currency'];
//   dataSource = new MatTableDataSource<CountryModel>();
//   isLoading: boolean = false;

//   totalItems: number = 0;
//   pageSize: number = 5;

//   @ViewChild(MatPaginator) paginator!: MatPaginator;

//   searchControl = new FormControl('');

//   constructor(
//     private countriesApiService: CountriesApiService,
//     private router: Router,
//     private snackBar: MatSnackBar,
//   ) {}
//   ngOnInit() {
//     this.fetchCountries(0, this.pageSize);

//     this.searchControl.valueChanges
//       .pipe(
//         debounceTime(300),
//         distinctUntilChanged(),
//         switchMap((query) => {
//           this.isLoading = true;

//           let result$: Observable<CountryModel[]>;

//           if (typeof query === 'string' && query.trim() === '') {
//             result$ = this.countriesApiService
//               .getCountries(0, this.pageSize)
//               .pipe(
//                 map((response) => {
//                   this.totalItems = response.totalCount;
//                   return response.data;
//                 }),
//               );
//           } else if (typeof query === 'string' && query.length >= 2) {
//             result$ = this.countriesApiService.searchCountries(query);
//           } else {
//             result$ = of([]);
//           }

//           return result$.pipe(
//             catchError(() => {
//               this.snackBar.open('Ошибка при поиске стран', 'Закрыть', {
//                 duration: 3000,
//               });
//               return of([]);
//             }),
//             finalize(() => (this.isLoading = false)),
//           );
//         }),
//       )
//       .subscribe((countries: CountryModel[]) => {
//         this.countries = countries;
//         this.dataSource.data = countries;
//         if (this.paginator) {
//           this.paginator.firstPage();
//         }
//       });
//   }

//   fetchCountries(offset: number = 0, limit: number = this.pageSize) {
//     this.isLoading = true;

//     this.countriesApiService
//       .getCountries(offset, limit)
//       .pipe(finalize(() => (this.isLoading = false)))
//       .subscribe({
//         next: (response) => {
//           this.countries = response.data;
//           this.totalItems = response.totalCount;
//           this.dataSource.data = this.countries;
//         },
//         error: () => {
//           this.snackBar.open('Ошибка при загрузке списка стран', 'Закрыть', {
//             duration: 3000,
//           });
//         },
//       });
//   }

//   onPageEvent(event: PageEvent) {
//     const offset = event.pageIndex * event.pageSize;
//     this.pageSize = event.pageSize;
//     this.fetchCountries(offset, event.pageSize);
//   }

//   goToCities(country: CountryModel) {
//     this.router.navigate(['/cities'], {
//       queryParams: {
//         countryName: country.name,
//         countryId: country.code,
//       },
//     });
//   }
// }
// export class CountriesComponent implements OnInit {
//   countries: CountryModel[] = [];
//   displayedColumns: string[] = ['id', 'name', 'code', 'currency'];
//   isLoading = false;
//   totalItems = 0;
//   pageSize = 5;
//   currentPage = 0;

//   searchControl = new FormControl('');
//   form!: FormGroup<any>;

//   constructor(private countriesApiService: CountriesApiService) {}

//   ngOnInit() {
//     this.fetchCountries(0, this.pageSize);

//     this.searchControl.valueChanges
//       .pipe(
//         debounceTime(300),
//         distinctUntilChanged(),
//         switchMap((query) => {
//           this.isLoading = true;

//           let result$;

//           if (typeof query === 'string' && query.trim() === '') {
//             result$ = this.countriesApiService.getCountries(0, this.pageSize).pipe(
//               map((response) => {
//                 this.totalItems = response.totalCount;
//                 return response.data;
//               })
//             );
//           } else if (typeof query === 'string' && query.length >= 2) {
//             result$ = this.countriesApiService.searchCountries(query);
//           } else {
//             result$ = of([]);
//           }

//           return result$.pipe(
//             catchError(() => {
//               // Обработка ошибки
//               return of([]);
//             }),
//             finalize(() => (this.isLoading = false))
//           );
//         })
//       )
//       .subscribe((countries: CountryModel[]) => {
//         this.countries = countries;
//         this.currentPage = 0;
//       });
//   }

//   fetchCountries(offset: number = 0, limit: number = this.pageSize) {
//     this.isLoading = true;

//     this.countriesApiService
//       .getCountries(offset, limit)
//       .pipe(finalize(() => (this.isLoading = false)))
//       .subscribe({
//         next: (response) => {
//           this.countries = response.data;
//           this.totalItems = response.totalCount;
//         },
//         error: () => {
//           // Обработка ошибки
//         },
//       });
//   }

//   onPageChange(page: number) {
//     const offset = page * this.pageSize;
//     this.currentPage = page;
//     this.fetchCountries(offset, this.pageSize);
//   }
// }
export class CountriesComponent implements OnInit {
  countries: CountryModel[] = [];
  displayedColumns: string[] = ['id', 'name', 'code', 'currency'];
  isLoading = false;
  totalItems = 0;
  pageSize = 5;
  searchControl = new FormControl('');
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form: FormGroup;
  dataSource: any;
  pageIndex = 0;
  // router: any;

  constructor(
    private countriesApiService: CountriesApiService,
    private snackBar: MatSnackBar,
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
            this.snackBar.open('Ошибка при поиске стран', 'Закрыть', {
              duration: 3000,
            });
            return of([]);
          }),
          finalize(() => (this.isLoading = false))
        );
      })
    )
    .subscribe((countries: CountryModel[]) => {
      this.countries = countries;

      // Если используешь пагинацию — возвращай первую страницу
      if (this.paginator) {
        this.paginator.firstPage();
      }
    });
}


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
        this.snackBar.open('Ошибка при загрузке списка стран', 'Закрыть', { duration: 3000 });
      }
    });
  }

  // onPageEvent(event: any): void {
  //   const offset = event.pageIndex * event.pageSize;
  //   this.pageSize = event.pageSize;
  //   this.fetchCountries(offset, event.pageSize);
  // }
  onPageEvent(index: number): void {
  this.pageIndex = index;
  this.fetchCountries(index, this.pageSize);
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