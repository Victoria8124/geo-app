import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { City, Country, CitiesResponse } from '../interfaces/cities.interace';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CitiesService {
  private readonly apiUrl =
    'http://geodb-free-service.wirefreethought.com/v1/geo';

  constructor(private http: HttpClient) {}

  // Получаем код страны по её названию
  getCountryCode(countryName: string): Observable<string> {
    return this.http
      .get<{ data: Country[] }>(
        `${this.apiUrl}/countries?namePrefix=${countryName}&limit=1`
      )
      .pipe(
        map((response) => response.data?.[0]?.code || ''),
        tap((code) => {
          if (!code) console.error(`Код страны для ${countryName} не найден`);
        }),
        catchError((error) => {
          console.error('Ошибка при получении кода страны:', error);
          return throwError(
            () => new Error('Ошибка при получении кода страны')
          );
        })
      );
  }

  // Получаем список всех стран
  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}/countries`);
  }

  // Получаем страну по названию
  getCountryByName(countryName: string): Observable<Country[]> {
    return this.http
      .get<{ data: Country[] }>(
        `${this.apiUrl}/countries?namePrefix=${countryName}&limit=1`
      )
      .pipe(map((response) => response.data || []));
  }
  // Получаем города по коду страны
  getCitiesByCountryCode(
    countryCode: string,
    offset: number,
    limit: number
  ): Observable<CitiesResponse> {
    return this.http.get<CitiesResponse>(
      `${this.apiUrl}/cities?countryIds=${countryCode}&offset=${offset}&limit=${limit}`
    );
  }

  // Поиск городов
  searchCities(query: string): Observable<City[]> {
    return this.http
      .get<{ data: City[] }>(
        `${this.apiUrl}/cities?namePrefix=${query}&limit=10`
      )
      .pipe(
        map((response) => response.data || [])
      );
  }

  // Получение данных о конкретном городе
    getCityDetails(cityId: string): Observable<City> {
      const url = `${this.apiUrl}/cities/${cityId}`;
      return this.http.get<City>(url);
    }
  }

