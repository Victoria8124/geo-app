import { CountriesService } from '../../services/countries.service';
import { Country } from '../../interfaces/country.interface';
import { CustomPaginatorComponent } from '../../components/paginator/custom-paginator.component'
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-countries',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatIconModule,
    RouterModule,
    CustomPaginatorComponent,
  ],
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss'],
})
export class CountriesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'code', 'currency'];
  countries: Country[] = []; // Список стран для таблицы
  searchQuery: string = '';
  pageTitle: string = 'Страны';

  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 5;

  constructor(
    private countriesService: CountriesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchCountries(); // Загружаем список стран при загрузке компонента
  }

  // Получение списка стран с API (с учетом пагинации)
  fetchCountries() {
    const offset = (this.currentPage - 1) * this.pageSize;
    const limit = this.pageSize

    this.countriesService.getCountries(offset, limit).subscribe({
      next: (response) => {
        this.countries = response.data;
        this.totalPages = Math.ceil(response.totalCount / this.pageSize); // обновляем количество страниц
      },
      error: (err) => {
        console.error('Ошибка при загрузке стран:', err);
      },
    });
  }

  // Поиск стран через API
  onSearch() {
    if (this.searchQuery.length >= 2) {
      this.countriesService.searchCountries(this.searchQuery).subscribe({
        next: (response: Country[]) => {
          this.countries = response;
        },
        error: (err) => {
          console.error('Ошибка при поиске стран:', err);
        },
      });
    } else {
      this.fetchCountries();
    }
  }

  // Пагинация
  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchCountries();
  }

  // Переход к списку городов по стране
  goToCities(countryName: string) {
    this.router.navigate(['/cities'], {
      queryParams: { countryName: countryName },
    });
  }
}
