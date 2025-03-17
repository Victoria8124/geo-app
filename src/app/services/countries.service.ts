import { Country } from '../interfaces/country.interface';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private apiUrl =
    'http://geodb-free-service.wirefreethought.com/v1/geo/countries';

  constructor(private http: HttpClient) {}

  // Получение списка стран с учетом пагинации
  getCountries(
    offset: number,
    limit: number
  ): Observable<{ data: Country[]; totalCount: number }> {
    return this.http
      .get<{ data: Country[]; metadata: { totalCount: number } }>(
        `${this.apiUrl}?offset=${offset}&limit=${limit}`
      )
      .pipe(
        map((response) => ({
          data: response.data,
          totalCount: response.metadata.totalCount, // Общее количество стран
        }))
      );
  }

  // Поиск стран по названию
    searchCountries(query: string): Observable<Country[]> {
      const url = `${this.apiUrl}?namePrefix=${query}&limit=10`;
      return this.http
        .get<{ data: Country[] }>(url)
        .pipe(map((response) => response.data));
    }
}

