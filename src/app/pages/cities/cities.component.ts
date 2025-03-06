import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CustomPaginatorComponent } from '../../components/paginator/custom-paginator.component';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CitiesService} from '../../services/cities.service'
import {
  City,
  Country,
  CitiesResponse,
} from '../../interfaces/cities.interace';
import { CityViewDialogComponent } from '../../components/popup/view/city-view-dialog.component'
import { MatDialog } from '@angular/material/dialog';

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
export class CityListComponent {
  selectedCountryName: string  = "";
  selectedCountry: Country | null = null;
  countries: Country[] = [];
  filteredCities: City[] = []; // Это теперь массив городов (тип City[])
  totalPages: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  displayedColumns: string[] = ['country', 'name', 'region', 'population'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citiesService: CitiesService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['countryName']) {
        this.selectedCountryName = params['countryName'];
        this.loadCountryByName(this.selectedCountryName); // Загружаем страну по имени
      }
    });
  }

  loadCountries(): void {
    this.citiesService.getCountries().subscribe((response: Country[]) => {
      this.countries = response || [];
    });
  }

  loadCountryByName(countryName: string): void {
    this.citiesService
      .getCountryByName(countryName)
      .subscribe((response: Country[]) => {
        if (response && response.length > 0) {
          this.selectedCountry = response[0];
          if (this.selectedCountry) {
            this.selectedCountryName = this.selectedCountry.name;
            this.countries = [this.selectedCountry];
            this.loadCitiesByCountry();
          }
        }
      });
  }

  loadCitiesByCountry(): void {
    if (!this.selectedCountryName) {
      this.filteredCities = [];
      return;
    }

    this.citiesService
      .getCountryCode(this.selectedCountryName)
      .pipe(
        switchMap((countryCode) => {
          if (!countryCode) return of(null);
          return this.citiesService.getCitiesByCountryCode(
            countryCode,
            (this.currentPage - 1) * this.pageSize,
            this.pageSize
          );
        })
      )
      .subscribe({
        next: (response: CitiesResponse | null) => {
          if (response) {
            this.filteredCities = response.data || [];
            this.totalPages = Math.ceil(
              (response.metadata?.totalCount || 0) / this.pageSize
            );
          }
        },
        error: (err) => console.error('Ошибка при загрузке городов:', err),
      });
  }

  onCountryChange() {
    this.currentPage = 1;
    this.loadCitiesByCountry();
  }

  openViewDialog(city: City): void {
    this.citiesService.getCityDetails(city.id).subscribe({
      next: (cityDetails) => {
        console.log('City details received:', cityDetails);
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

  onSearch() {
    if (this.searchQuery.length >= 2) {
      this.citiesService.searchCities(this.searchQuery).subscribe({
        next: (response: City[]) => {
          this.filteredCities = response; 
        },
        error: (err) => {
          console.error('Ошибка при поиске городов:', err);
        },
        complete: () => {
          console.log('Поиск завершен');
        },
      });
    } else {
      this.filteredCities = []; 
    }
  }

  getOffsetFromLink(linkObject: { href: string; rel: string }): number {
    if (!linkObject?.href) return 0;
    const offsetMatch = linkObject.href.match(/offset=(\d+)/);
    return offsetMatch ? parseInt(offsetMatch[1], 10) : 0;
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadCitiesByCountry(); 
  }
}