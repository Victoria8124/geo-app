import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CitiesApiService } from '../../services/cities.service';
import { CityModel } from '../../interfaces/city.model';
import { PaginationResponse } from '../../interfaces/pagination-response.model';
import { CountryModel } from '../../interfaces/country.model';
import { CityViewDialogComponent } from '../../components/popup/view/city-view-dialog.component';
import { CountriesApiService } from '../../services/countries.service';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import {  ScrollingModule } from '@angular/cdk/scrolling';
import {ChangeDetectionStrategy} from '@angular/core';
import {TuiLet, TuiStringHandler} from '@taiga-ui/cdk';
import {TuiDataList, TuiLoader, TuiScrollable, TuiScrollbar, TuiTextfieldComponent} from '@taiga-ui/core';
import {TuiChevron, TuiFilterByInputPipe, TuiPagination, TuiSelectDirective} from '@taiga-ui/kit';
import {TuiComboBoxModule, TuiInputModule} from '@taiga-ui/legacy';

import {IndexScrolledDirective} from './index-change.directive';
import {TuiTableDirective, TuiTableTd, TuiTableTh} from '@taiga-ui/addon-table';
import { TuiDialogService } from '@taiga-ui/core';
import { inject } from '@angular/core';

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
    TuiDataList,
    TuiInputModule,
    TuiTableDirective,
    TuiTableTh,
    TuiTableTd,
    TuiLoader,
    TuiPagination,
    // IndexScrolledDirective,
    // TuiDialogModule, 
    // TuiRootDialogModule
  ],
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
}) 
// export class CitiesComponent {
//   formControl = new FormControl();
//   selectedCountryName: string = '';
//   selectedCountry: CountryModel | null = null;
//   countries: CountryModel[] = [];
//   filteredCities: CityModel[] = [];
//   currentPage: number = 1;
//   pageSize: number = 5;
//   searchControl: FormControl = new FormControl('');
//   pageIndex = 0;
//   displayedColumns: string[] = ['country', 'name', 'region', 'population'];
//   totalItems: number = 0;
//   isLoading: boolean = false;

//   protected value = null;

//   public stringifyCountry: TuiStringHandler<CountryModel> = (item: CountryModel) => item.name;
//  private readonly dialogService = inject(TuiDialogService);

//   constructor(
//     private route: ActivatedRoute,
//     private citiesApiService: CitiesApiService,
//     private countriesApiService: CountriesApiService,
//   ) {}

// ngOnInit(): void {
//   this.route.queryParams.subscribe((params) => {
//     const countryId = params['countryId'];
//     const countryName = params['countryName'];

//     if (countryId && countryName) {
//       this.selectedCountry = {
//         code: countryId,
//         name: countryName,
//       } as CountryModel;
//       this.selectedCountryName = countryName;
//       this.loadCitiesByCountry(countryId);
//     }
//     this.loadCountries(0, this.pageSize);
//   });

//     this.searchControl.valueChanges
//       .pipe(debounceTime(300), distinctUntilChanged())
//       .subscribe((value: string) => {
//         this.countries = [];
//         if (!value) {
//           this.loadCountries(0, this.pageSize);
//         } else if (value.length >= 2) {
//           this.onSearch(value);
//         }
//       });

//     this.formControl.valueChanges.subscribe((country: CountryModel) => {
//       this.selectedCountry = country;
//       this.onCountryChange();
//     });
//   }

// loadCountries(offset: number, limit: number): void {
//   console.log(`Запрос стран: offset=${offset}, limit=${limit}`);

//   this.isLoading = true;
//   this.countriesApiService.getCountries(offset, limit).subscribe({
//     next: (response) => {
//       console.log('Ответ пришёл:', response);
//       this.countries = [...this.countries, ...response.data];
//       this.totalItems = response.totalCount;
//       this.isLoading = false;
//     },
//     error: () => {
//       this.isLoading = false;
//     },
//   });
// }


// onScroll(index: number): void {
//   console.log('Scrolled to index:', index);
//   console.log('Загружено стран:', this.countries.length, ' из ', this.totalItems);

//   const totalItemsLoaded = this.countries.length;

//   if (
//     !this.isLoading &&
//     totalItemsLoaded < this.totalItems &&
//     index >= 1 
//   ) {
//     console.log('Loading more countries...');
//     this.loadCountries(totalItemsLoaded, this.pageSize);
//   }
// }

//   loadCitiesByCountry(countryCode: string): void {
//     if (!countryCode) {
//       this.filteredCities = [];
//       this.totalItems = 0;
//       return;
//     }

//     this.isLoading = true;
//     this.citiesApiService
//       .getCities({
//         countryCode,
//         offset: this.pageIndex * this.pageSize,
//         limit: this.pageSize,
//       })
//       .subscribe({
//         next: (response: PaginationResponse<CityModel>) => {
//           this.filteredCities = response.data || [];
//           this.totalItems = response.metadata?.totalCount ?? 0;
//           this.isLoading = false;
//         },
//         error: () => {
//           this.isLoading = false;
//         },
//       });
//   }

//   onCountryChange(): void {
//     this.currentPage = 1;
//     this.pageIndex = 0;
//     if (this.selectedCountry?.code) {
//       this.loadCitiesByCountry(this.selectedCountry.code);
//     } else {
//       this.filteredCities = [];
//       this.totalItems = 0;
//     }
//   }

//   loadCountryByCode(countryCode: string): void {
//     this.isLoading = true;
//     this.countriesApiService.getCountryDetails(countryCode).subscribe({
//       next: (country: CountryModel) => {
//         this.selectedCountry = country;
//         this.selectedCountryName = country.name;
//         this.countries = [this.selectedCountry];
//         this.loadCitiesByCountry(country.code);
//         this.isLoading = false;
//       },
//       error: () => {
//         this.isLoading = false;
//       },
//     });
//   }


// openViewDialog(city: CityModel): void {
//   this.citiesApiService.getCityDetails(city.id).subscribe({
//     next: (data: CityModel) => {
//     const html = `
//         <div>
//           <strong>Город:</strong> ${data.name}<br />
//           <strong>Страна:</strong> ${data.country}<br />
//           <strong>Регион:</strong> ${data.region}<br />
//           <strong>Население:</strong> ${data.population}<br />
//           <strong>Координаты:</strong> ${data.latitude}, ${data.longitude}
//         </div>
//       `;

//       this.dialogService
//         .open(html, {
//           label: `Информация о городе: ${data.name}`,
//           size: 's',
//           closeable: true,
//         })
//         .subscribe();
//     },
//     error: () => {
//       console.error('Ошибка при получении города');
//     },
//   });
// }



//   onSearch(searchText: string): void {
//     this.isLoading = true;
//     this.filteredCities = [];

//     this.citiesApiService
//       .getCities({
//         namePrefix: searchText,
//         limit: this.pageSize,
//         offset: this.pageIndex * this.pageSize,
//       })
//       .subscribe({
//         next: (response) => {
//           this.filteredCities = response.data || [];
//           this.totalItems = response.metadata?.totalCount ?? 0;
//           this.isLoading = false;
//         },
//         error: () => {
//           this.isLoading = false;
//         },
//       });
//   }
// onPageChange(page: number): void {
//   this.pageIndex = page;

//   if (this.selectedCountry?.code) {
//     this.loadCitiesByCountry(this.selectedCountry.code);
//   } else if (this.searchControl.value) {
//     this.onSearch(this.searchControl.value);
//   }
// }
// }
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

  constructor(
    private route: ActivatedRoute,
    private citiesApiService: CitiesApiService,
    private countriesApiService: CountriesApiService,
  ) {}

  ngOnInit(): void {
    this.initRouteListener();
    this.initSearchListener();
    this.loadCountries();
  }

  /** Инициализация параметров из URL */
   initRouteListener(): void {
    this.route.queryParams.subscribe((params) => {
      const countryId = params['countryId'];

      if (countryId) {
        this.loadCountryById(countryId);
      }
    });
  }

  /**  Загрузка страны по `countryId` */
   loadCountryById(countryId: string): void {
    this.isLoading = true;

    this.countriesApiService.getCountryDetails(countryId).subscribe({
      next: (country) => {
        this.selectedCountry = country;
        this.loadCities();
      },
      error: () => {
        console.error('Ошибка при загрузке данных о стране');
        this.resetCityData();
      },
      complete: () => {
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


/**  Обработка изменений в поисковом инпуте */
initSearchListener(): void {
  this.searchControl.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe((value: string | null) => {
      console.log('Поиск запущен. Введено значение:', value);

      const query = value?.trim() ?? '';

      this.pageIndex = 0; // Сбросим страницу при новом поисковом запросе
      this.countries = [];

      if (query.length >= 2) {
        this.searchCities(query, this.pageIndex, this.pageSize);
      
      }    else if (query.length === 0) {
        console.log('Инпут очищен. Загружаем все страны и города.');
        this.loadCountries();
        this.loadCities();
      } 
      else {
        this.loadCountries(0);
      }
    });
}
/** Обработка изменений в поисковом инпуте */
// initSearchListener(): void {
//   this.searchControl.valueChanges
//     .pipe(debounceTime(300), distinctUntilChanged())
//     .subscribe((value: string | null) => {
//       const query = value?.trim() ?? '';
//       this.pageIndex = 0;

//       console.log('Поиск запущен. Введено значение:', query);

//       if (query.length >= 2) {
//         console.log('Поиск стран по запросу:', query);
//         this.searchCities(query, this.pageIndex, this.pageSize);
//       } 
//       else if (query.length === 0) {
//         console.log('Инпут очищен. Загружаем все страны и города.');
//         this.loadCountries();
//         this.loadCities();
//       }
//     });
// }
/** Загрузка списка стран */
loadCountries(offset: number = 0): void {
  this.isLoading = true;
  console.log(`Загрузка стран с offset: ${offset}`);

  this.countriesApiService.getCountries(offset, this.pageSize).subscribe({
    next: (response) => {
      console.log('Ответ на загрузку стран:', response);
      this.countries = [...this.countries, ...response.data];
      this.totalCountries = response.totalCount;
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Ошибка при загрузке стран:', err);
      this.isLoading = false;
    }
  });
}
/**  Поиск городов */
searchCities(query: string, pageIndex: number = 0, pageSize: number = 10): void {
  this.isLoading = true;

  console.log('Поиск городов начат для:', query, `Страница: ${pageIndex}, Лимит: ${pageSize}`);

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
    },
    error: (err) => {
      console.error('Ошибка при поиске городов:', err);
      this.isLoading = false;
    }
  });
}



  /** Загрузка городов по стране */
  loadCities(): void {
    if (!this.selectedCountry) {
      this.resetCityData();
      return;
    }

    this.isLoading = true;

    this.citiesApiService.getCities({
      countryCode: this.selectedCountry.code,
      offset: this.pageIndex * this.pageSize,
      limit: this.pageSize,
    }).subscribe({
      next: (response) => {
        this.filteredCities = response.data;
        this.totalCities = response.metadata?.totalCount ?? 0;
      },
      error: () => {
        console.error('Ошибка при загрузке городов');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
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

  /**  Изменение страны */
  onCountryChange(): void {
    this.pageIndex = 0;
    this.loadCities();
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
        console.error('Ошибка при загрузке данных о городе');
      }
    });
  }

  /** Пагинация */
onPageChange(page: number): void {
  this.pageIndex = page;

  const query = this.searchControl.value?.trim() ?? '';

  if (query.length >= 2) {
    this.searchCities(query, this.pageIndex, this.pageSize);
  } else {
    this.loadCountries(this.pageIndex * this.pageSize);
  }
}

}