import { CountryModel } from '../interfaces/country.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CountriesApiService {
  private apiUrl = 'http://geodb-free-service.wirefreethought.com/v1/geo';

  constructor(private http: HttpClient) {}

  // Получение списка стран с учетом пагинации
  getCountries(
    offset: number,
    limit: number
  ): Observable<{ data: CountryModel[]; totalCount: number }> {
    return this.http
      .get<{ data: CountryModel[]; metadata: { totalCount: number } }>(
        `${this.apiUrl}/countries?offset=${offset}&limit=${limit}`
      )
      .pipe(
        map((response) => ({
          data: response.data,
          totalCount: response.metadata.totalCount, // Общее количество стран
        }))
      );
  }

  // Поиск стран по названию
  searchCountries(query: string): Observable<CountryModel[]> {
    const url = `${this.apiUrl}/countries?namePrefix=${query}`;
    return this.http
      .get<{ data: CountryModel[] }>(url)
      .pipe(map((response) => response.data));
  }

  // Получаем код страны по её названию и получаем страну по названию
  getCountryDetails(countryId: string): Observable<CountryModel> {
    return this.http
      .get<{ data: CountryModel }>(`${this.apiUrl}/countries/${countryId}`)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Ошибка при получении данных о стране:', error);
          return throwError(
            () => new Error('Ошибка при получении данных о стране')
          );
        })
      );
  }
}
