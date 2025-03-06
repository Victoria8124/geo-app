import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Country } from '../interfaces/country.interface';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private apiUrl =
    'http://geodb-free-service.wirefreethought.com/v1/geo/countries';

  constructor(private http: HttpClient) {}

  getCountries(offset: number, limit: number): Observable<Country[]> {
    return this.http
      .get<{ data: Country[] }>(
        `${this.apiUrl}?offset=${offset}&limit=${limit}`
      )
      .pipe(map((response) => response.data)); 
  }

  searchCountries(query: string): Observable<Country[]> {
    const url = `${this.apiUrl}?namePrefix=${query}&limit=10`;
    return this.http
      .get<{ data: Country[] }>(url)
      .pipe(map((response) => response.data)); 
  }
}
