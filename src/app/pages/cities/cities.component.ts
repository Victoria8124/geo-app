import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CustomPaginatorComponent } from '../../components/paginator/custom-paginator.component';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router';
import { CitiesApiService} from '../../services/cities.service'
import {
  City,
  Country,
  CitiesResponse,
} from '../../interfaces/cities.interace';
import { CityViewDialogComponent } from '../../components/popup/view/city-view-dialog.component'
import { MatDialog } from '@angular/material/dialog';
import {CountriesApiService} from '../../services/countries.service'
@Component({
  selector: 'app-cities',
  imports: [
    MatTableModule,
    RouterModule,
    MatIconModule,
    CustomPaginatorComponent,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss'],
})
export class CitiesComponent {
  selectedCountryName: string = '';
  selectedCountry: Country | null = null;
  countries: Country[] = [];
  filteredCities: City[] = [];
  totalPages: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;
  searchQuery: string = '';
  displayedColumns: string[] = ['country', 'name', 'region', 'population'];

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
      if (countryId) {
        this.loadCountryByCode(countryId);
      }
    });
  }

  loadCountryByCode(countryCode: string): void {
    this.countriesApiService
      .getCountryDetails(countryCode)
      .subscribe((country: Country) => {
        this.selectedCountry = country;
        this.selectedCountryName = country.name;
        this.countries = [country];
        this.loadCitiesByCountry(country.code);
      });
  }
  loadCitiesByCountry(countryCode: string): void {
    if (!countryCode) {
      this.filteredCities = [];
      return;
    }

    this.citiesApiService
      .getCities({
        countryCode,
        offset: (this.currentPage - 1) * this.pageSize,
        limit: this.pageSize,
      })
      .subscribe({
        next: (response: CitiesResponse) => {
          this.filteredCities = response.data || [];
          this.totalPages = Math.ceil(
            (response.metadata?.totalCount ?? 0) / this.pageSize
          );
        },
        error: (err) => console.error('Ошибка при загрузке городов:', err),
      });
  }

  onCountryChange() {
    this.currentPage = 1;
    if (this.selectedCountry?.code) {
      this.loadCitiesByCountry(this.selectedCountry.code);
    }
  }

  openViewDialog(city: City): void {
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
  onSearch(): void {
    if (this.searchQuery.length >= 2) {
      this.citiesApiService
        .getCities({
          namePrefix: this.searchQuery,
          limit: 5,
        })
        .subscribe({
          next: (response) => {
            this.filteredCities = response.data || [];
          },
          error: (err) => {
            console.error('Ошибка при поиске городов:', err);
          },
        });
    } else {
      this.filteredCities = [];
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    if (this.selectedCountry?.code) {
      this.loadCitiesByCountry(this.selectedCountry.code);
    }
  }
}
