import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { Component, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CitiesApiService } from '../../services/cities.service';
import { CityModel } from '../../interfaces/city.model';
import { PaginationResponse } from '../../interfaces/pagination-response.model'
import { CountryModel } from '../../interfaces/country.model';
import { CityViewDialogComponent } from '../../components/popup/view/city-view-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CountriesApiService } from '../../services/countries.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  finalize,
  filter,
} from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

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
  ],
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss'],
})
export class CitiesComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  selectedCountryName: string = '';
  selectedCountry: CountryModel | null = null;
  countries: CountryModel[] = [];
  filteredCities: CityModel[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  searchControl: FormControl = new FormControl('');

  displayedColumns: string[] = ['country', 'name', 'region', 'population'];
  totalItems: number = 0;
  isLoading: boolean = false; // Показывает, идет ли загрузка

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citiesApiService: CitiesApiService,
    private dialog: MatDialog,
    private countriesApiService: CountriesApiService
  ) {}
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const countryId = params['countryId'];
      const countryName = params['countryName'];

      if (countryId && countryName) {
        // Если есть и код, и название страны — сразу создаем объект страны без запроса на сервер
        this.selectedCountry = {
          code: countryId,
          name: countryName,
        } as CountryModel;
        this.selectedCountryName = countryName;
        this.countries = [this.selectedCountry];
        this.loadCitiesByCountry(countryId);
      } else if (countryId) {
        // Если вдруг есть только код — тогда грузим страну с сервера
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

  // Эту функцию оставляем, вдруг где-то еще отдельно захотим загрузить страну по коду
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
        console.error('Ошибка при загрузке страны:', err);
        this.isLoading = false;
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
        error: (err) => {
          console.error('Ошибка при загрузке городов:', err);
          this.isLoading = false;
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
      error: (err) => {
        console.error('Ошибка при получении данных города:', err);
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
        error: (err) => {
          console.error('Ошибка при поиске городов:', err);
          this.isLoading = false;
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
}
