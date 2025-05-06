import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { Component, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CitiesApiService } from '../../services/cities.service';
import { CityModel } from '../../interfaces/city.model';
import { PaginationResponse } from '../../interfaces/pagination-response.model';
import { CountryModel } from '../../interfaces/country.model';
import { CityViewDialogComponent } from '../../components/popup/view/city-view-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CountriesApiService } from '../../services/countries.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import {ScrollingModule} from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy} from '@angular/core';
import {TuiLet} from '@taiga-ui/cdk';
import {TuiDataList, TuiLoader, TuiScrollable, TuiScrollbar, TuiTextfieldComponent} from '@taiga-ui/core';
import {TuiChevron, TuiFilterByInputPipe, TuiPagination, TuiSelectDirective} from '@taiga-ui/kit';
import {TuiComboBoxModule, TuiInputModule} from '@taiga-ui/legacy';

import {IndexChange} from './index-change.directive';
import {TuiTableDirective, TuiTableTd, TuiTableTh} from '@taiga-ui/addon-table';
@Component({
  selector: 'app-cities',
  imports: [
    MatTableModule,
    RouterModule,
    MatIconModule,
    FormsModule,
    CommonModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    // IndexChange,
    ScrollingModule,
    TuiComboBoxModule,
    TuiDataList,
    TuiFilterByInputPipe,
    TuiLet,
    TuiScrollable,
    // TuiScrollbar,
    // TuiTextfieldComponent,
    IndexChange,
    TuiComboBoxModule,
    TuiDataList,
    // TuiSelectDirective,
    // TuiChevron,
    TuiInputModule,
    TuiTableDirective,
    TuiTableTh,
    TuiTableTd,
    TuiLoader,
    TuiPagination,
  ],
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  formControl = new FormControl();
  selectedCountryName: string = '';
  selectedCountry: CountryModel | null = null;
  countries: CountryModel[] = [];
  filteredCities: CityModel[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  searchControl: FormControl = new FormControl('');
  pageIndex = 0;
  displayedColumns: string[] = ['country', 'name', 'region', 'population'];
  totalItems: number = 0;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private citiesApiService: CitiesApiService,
    private dialog: MatDialog,
    private countriesApiService: CountriesApiService,
    private snackBar: MatSnackBar,
  ) {}
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const countryId = params['countryId'];
      const countryName = params['countryName'];

      if (countryId && countryName) {
        this.selectedCountry = {
          code: countryId,
          name: countryName,
        } as CountryModel;
        this.selectedCountryName = countryName;
        this.countries = [this.selectedCountry];
        this.loadCitiesByCountry(countryId);
      } else if (countryId) {
        this.loadCountryByCode(countryId);
      }
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value: string) => {
        if (!value) {
          this.loadCitiesByCountry(this.selectedCountry?.code || '');
        } else if (value.length >= 2) {
          this.onSearch(value);
        }
      });
  }

  loadCountryByCode(countryCode: string): void {
    this.isLoading = true;
    this.countriesApiService.getCountryDetails(countryCode).subscribe({
      next: (country: CountryModel) => {
        this.selectedCountry = country;
        this.selectedCountryName = country.name;
        this.countries = [country];
        this.loadCitiesByCountry(country.code);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Ошибка при загрузке страны!', 'Закрыть', {
          duration: 3000,
        });
      },
    });
  }

  loadCitiesByCountry(countryCode: string): void {
    if (!countryCode) {
      this.filteredCities = [];
      this.totalItems = 0;
      return;
    }

    this.isLoading = true;
    this.citiesApiService
      .getCities({
        countryCode,
        offset: (this.currentPage - 1) * this.pageSize,
        limit: this.pageSize,
      })
      .subscribe({
        next: (response: PaginationResponse<CityModel>) => {
          this.filteredCities = response.data || [];
          this.totalItems = response.metadata?.totalCount ?? 0;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Ошибка при загрузке страны!', 'Закрыть', {
            duration: 3000,
          });
        },
      });
  }

  onCountryChange(): void {
    this.currentPage = 1;
    if (this.selectedCountry?.code) {
      this.loadCitiesByCountry(this.selectedCountry.code);
    }
  }

  openViewDialog(city: CityModel): void {
    this.citiesApiService.getCityDetails(city.id).subscribe({
      next: (cityDetails) => {
        if (cityDetails) {
          this.dialog.open(CityViewDialogComponent, {
            data: { cityDetails },
          });
        } else {
          console.error('Данные о городе не получены');
        }
      },
      error: () => {
        this.snackBar.open('Ошибка при загрузке страны!', 'Закрыть', {
          duration: 3000,
        });
      },
    });
  }

  onSearch(searchText: string): void {
    this.isLoading = true;
    this.filteredCities = [];

    this.citiesApiService
      .getCities({
        namePrefix: searchText,
        limit: 5,
      })
      .subscribe({
        next: (response) => {
          this.filteredCities = response.data || [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Ошибка при загрузке страны!', 'Закрыть', {
            duration: 3000,
          });
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    if (this.selectedCountry?.code) {
      this.loadCitiesByCountry(this.selectedCountry.code);
    }
  }

  // onPageEvent(index: number): void {
  //   this.pageIndex = index;
  //   // this.loadCitiesByCountry(index, this.pageSize);
  // }

}
