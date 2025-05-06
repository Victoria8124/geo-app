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
    TuiFilterByInputPipe,
    TuiLet,
    TuiScrollable,
    TuiComboBoxModule,
    TuiDataList,
    TuiInputModule,
    TuiTableDirective,
    TuiTableTh,
    TuiTableTd,
    TuiLoader,
    TuiPagination,
    IndexScrolledDirective,
    // TuiDialogModule, 
    // TuiRootDialogModule
  ],
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
}) 
export class CitiesComponent {
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

  protected value = null;

  public stringifyCountry: TuiStringHandler<CountryModel> = (item: CountryModel) => item.name;
 private readonly dialogService = inject(TuiDialogService);

  constructor(
    private route: ActivatedRoute,
    private citiesApiService: CitiesApiService,
    private countriesApiService: CountriesApiService,
  ) {}

ngOnInit(): void {
  this.route.queryParams.subscribe((params) => {
    const countryId = params['countryId'];
    const countryName = params['countryName'];

    if (countryId && countryName) {
      this.selectedCountry = {
        code: countryId,
        name: countryName,
      } as CountryModel;
      this.selectedCountryName = countryName;
      this.loadCitiesByCountry(countryId);
    }
    this.loadCountries(0, this.pageSize);
  });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value: string) => {
        this.countries = [];
        if (!value) {
          this.loadCountries(0, this.pageSize);
        } else if (value.length >= 2) {
          this.onSearch(value);
        }
      });

    this.formControl.valueChanges.subscribe((country: CountryModel) => {
      this.selectedCountry = country;
      this.onCountryChange();
    });
  }

loadCountries(offset: number, limit: number): void {
  console.log(`Запрос стран: offset=${offset}, limit=${limit}`);

  this.isLoading = true;
  this.countriesApiService.getCountries(offset, limit).subscribe({
    next: (response) => {
      console.log('Ответ пришёл:', response);
      this.countries = [...this.countries, ...response.data];
      this.totalItems = response.totalCount;
      this.isLoading = false;
    },
    error: () => {
      this.isLoading = false;
    },
  });
}


onScroll(index: number): void {
  console.log('Scrolled to index:', index);
  console.log('Загружено стран:', this.countries.length, ' из ', this.totalItems);

  const totalItemsLoaded = this.countries.length;

  if (
    !this.isLoading &&
    totalItemsLoaded < this.totalItems &&
    index >= 1 
  ) {
    console.log('Loading more countries...');
    this.loadCountries(totalItemsLoaded, this.pageSize);
  }
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
        offset: this.pageIndex * this.pageSize,
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
        },
      });
  }

  onCountryChange(): void {
    this.currentPage = 1;
    this.pageIndex = 0;
    if (this.selectedCountry?.code) {
      this.loadCitiesByCountry(this.selectedCountry.code);
    } else {
      this.filteredCities = [];
      this.totalItems = 0;
    }
  }

  loadCountryByCode(countryCode: string): void {
    this.isLoading = true;
    this.countriesApiService.getCountryDetails(countryCode).subscribe({
      next: (country: CountryModel) => {
        this.selectedCountry = country;
        this.selectedCountryName = country.name;
        this.countries = [this.selectedCountry];
        this.loadCitiesByCountry(country.code);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }


openViewDialog(city: CityModel): void {
  this.citiesApiService.getCityDetails(city.id).subscribe({
    next: (data: CityModel) => {
    const html = `
        <div>
          <strong>Город:</strong> ${data.name}<br />
          <strong>Страна:</strong> ${data.country}<br />
          <strong>Регион:</strong> ${data.region}<br />
          <strong>Население:</strong> ${data.population}<br />
          <strong>Координаты:</strong> ${data.latitude}, ${data.longitude}
        </div>
      `;

      this.dialogService
        .open(html, {
          label: `Информация о городе: ${data.name}`,
          size: 's',
          closeable: true,
        })
        .subscribe();
    },
    error: () => {
      console.error('Ошибка при получении города');
    },
  });
}



  onSearch(searchText: string): void {
    this.isLoading = true;
    this.filteredCities = [];

    this.citiesApiService
      .getCities({
        namePrefix: searchText,
        limit: this.pageSize,
        offset: this.pageIndex * this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.filteredCities = response.data || [];
          this.totalItems = response.metadata?.totalCount ?? 0;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }
onPageChange(page: number): void {
  this.pageIndex = page;

  if (this.selectedCountry?.code) {
    this.loadCitiesByCountry(this.selectedCountry.code);
  } else if (this.searchControl.value) {
    this.onSearch(this.searchControl.value);
  }
}
}
