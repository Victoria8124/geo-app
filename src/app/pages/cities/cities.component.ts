import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CitiesApiService } from '../../services/cities.service';
import { CityModel } from '../../interfaces/city.model';
import { CountryModel } from '../../interfaces/country.model';
import { CountriesApiService } from '../../services/countries.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {  ScrollingModule } from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy} from '@angular/core';
import { TuiStringHandler} from '@taiga-ui/cdk';
import {TuiDataList, TuiLoader, TuiScrollable} from '@taiga-ui/core';
import {TuiPagination} from '@taiga-ui/kit';
import {TuiComboBoxModule, TuiInputModule} from '@taiga-ui/legacy';

import {TuiTableDirective, TuiTableTd, TuiTableTh} from '@taiga-ui/addon-table';
import { TuiDialogService } from '@taiga-ui/core';
import { inject } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import {TuiAlertService} from '@taiga-ui/core';

@Component({
  selector: 'app-cities',
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    ScrollingModule,
    TuiComboBoxModule,
    TuiDataList,
    TuiScrollable,
    TuiComboBoxModule,
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
  private readonly dialogService = inject(TuiDialogService);
  formControl = new FormControl();
  searchControl = new FormControl('');

  selectedCountry: CountryModel | null = null;
  countries: CountryModel[] = [];
  filteredCities: CityModel[] = [];
  pageSize: number = 5;
  pageIndex: number = 0;
  totalCountries: number = 0;
  totalCities: number = 0;
  isLoading: boolean = false;
  public stringifyCountry: TuiStringHandler<CountryModel> = (item: CountryModel) => item.name;
  private readonly alerts = inject(TuiAlertService);

  constructor(
    private route: ActivatedRoute,
    private citiesApiService: CitiesApiService,
    private countriesApiService: CountriesApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initRouteListener();
    this.initSearchListener();
    this.loadCountries();

    this.formControl.valueChanges.subscribe((country: CountryModel | null) => {
    this.selectedCountry = country;
    this.onCountryChange();
  });
 } 

  /* Инициализация параметров из URL */
   initRouteListener(): void {
    this.route.queryParams.subscribe((params) => {
      const countryId = params['countryId'];

      if (countryId) {
        this.loadCountryById(countryId);
      }
    });
  }


 /** ================== ЗАГРУЗКА ДАННЫХ ================== **/

  /* загрузка страны по `countryId` */
   loadCountryById(countryId: string): void {
    this.isLoading = true;

    this.countriesApiService.getCountryDetails(countryId).subscribe({
      next: (country) => {
        this.selectedCountry = country;
        this.loadCitiesByCountry(this.selectedCountry.code);
      },
      error: () => {
         this.showError('Не удалось загрузить. Попробуйте снова.');
        this.resetCityData();
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  } 

/** Загрузка списка стран */
  loadCountries(offset: number = 0): void {
  this.isLoading = true;

  this.countriesApiService.getCountries(offset, this.pageSize).subscribe({
    next: (response) => {
      this.countries =  [...this.countries, ...response.data];
      this.totalCountries = response.totalCount;
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: () => {
       this.showError('Не удалось загрузить. Попробуйте снова.');
      this.isLoading = false;
    }
  });
}

  /** Загрузка городов по стране */
  loadCitiesByCountry(countryCode: string): void {
  this.isLoading = true;

  const options = {
    countryCode,
    offset: this.pageIndex * this.pageSize,
    limit: this.pageSize,
  };

  this.citiesApiService.getCities(options).subscribe({
    next: (response) => {
      this.filteredCities = response.data;
      this.totalCities = response.metadata?.totalCount ?? 0;
      this.isLoading = false;
            this.cdr.detectChanges();
    },
    error: () => {
      this.showError('Не удалось загрузить. Попробуйте снова.');
      this.isLoading = false;
    }
  });
}

/** ================== ОБРАБОТКА СОБЫТИЙ ================== **/

/**  Обработка скролла */
onScroll(event: Event): void {
  const target = event.target as HTMLElement;
  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const offsetHeight = target.offsetHeight;

  const isNearBottom = scrollTop + offsetHeight >= scrollHeight - 50;

  if (isNearBottom && !this.isLoading && this.countries.length < this.totalCountries) {
    this.loadCountries(this.countries.length);
  }
}

 /** Изменение выбранной страны */
 onCountryChange(): void {
  this.pageIndex = 0;

  if (this.selectedCountry?.code) {
    this.loadCitiesByCountry(this.selectedCountry.code);
  } else {
    this.filteredCities = [];
    this.totalCities = 0;
  }
 }

 /** Пагинация */
 onPageChange(page: number): void {
  this.pageIndex = page;

  const query = this.searchControl.value?.trim() ?? '';

  if (this.selectedCountry) {
    this.loadCitiesByCountry(this.selectedCountry.code);
    return;
  }

  if (query.length >= 2) {
    this.searchCities(query, this.pageIndex, this.pageSize);
  } 
  else {
    this.loadCountries(this.pageIndex * this.pageSize);
  }
 }

  /**  Обработка изменений в поисковом инпуте */
 initSearchListener(): void {
  this.searchControl.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe((value: string | null) => {

      const query = value?.trim() ?? '';

      this.pageIndex = 0; 
      this.countries = [];
      this.isLoading = true;

      if (query.length >= 2) {
        this.searchCities(query, this.pageIndex, this.pageSize);
            } else if (query.length === 0) {
                this.loadCountries();
                this.filteredCities = [];
                this.totalCities = 0;
                if (this.selectedCountry) {
                  this.loadCitiesByCountry(this.selectedCountry.code);
                } else {
                  this.isLoading = false;
                  }
         }});
  }

  /**  Поиск городов */
  searchCities(query: string, pageIndex: number = 0, pageSize: number = 10): void {
  this.isLoading = true;

  const options = {
    namePrefix: query,
    offset: pageIndex * pageSize,
    limit: pageSize,
  };

  this.citiesApiService.getCities(options).subscribe({
    next: (response) => {
      console.log('Ответ на поиск городов:', response);
      this.filteredCities = response.data;
      this.totalCities = response.metadata?.totalCount ?? 0;
      this.isLoading = false;
        this.cdr.detectChanges();
    },
    error: () => {
      this.showError('Не удалось загрузить. Попробуйте снова.');
      this.isLoading = false;
    }
  });
 }

 /** Сброс данных о городах */
   resetCityData(): void {
    this.selectedCountry = null;
    this.filteredCities = [];
    this.totalCities = 0;
  }

  /**  Открытие диалога */
  openViewDialog(city: CityModel): void {
    this.citiesApiService.getCityDetails(city.id).subscribe({
      next: (data) => {
        const html = `
          <div>
            <strong>Город:</strong> ${data.name}<br />
            <strong>Страна:</strong> ${data.country}<br />
            <strong>Регион:</strong> ${data.region}<br />
            <strong>Население:</strong> ${data.population}<br />
            <strong>Координаты:</strong> ${data.latitude}, ${data.longitude}
          </div>
        `;

        this.dialogService.open(html, {
          label: `Информация о городе: ${data.name}`,
          size: 's',
          closeable: true,
        }).subscribe();
      },
      error: () => {
        this.showError('Не удалось загрузить. Попробуйте снова.');
      }
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