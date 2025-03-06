import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { City, Country, CitiesResponse } from '../interfaces/cities.interace'
import { map, tap } from 'rxjs/operators';


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
      .get<any>(`${this.apiUrl}/countries?namePrefix=${countryName}&limit=1`)
      .pipe(
        map((response) => response.data?.[0]?.code || ''),
        tap((code) => {
          if (!code) console.error(`Код страны для ${countryName} не найден`);
        })
      );
  }

  // Получаем все страны
  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}/countries`);
  }

  // Получаем страну по названию
  getCountryByName(countryName: string): Observable<Country[]> {
    return this.http.get<Country[]>(
      `${this.apiUrl}/countries?namePrefix=${countryName}&limit=1`
    );
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
    const url = `${this.apiUrl}/cities?namePrefix=${query}&limit=10`;
    return this.http.get<City[]>(url);
  }

  // Получение данных о конкретном городе
  getCityDetails(cityId: string): Observable<City> {
    const url = `${this.apiUrl}/cities/${cityId}`;
    return this.http.get<City>(url);
  }
}