import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { City, CitiesResponse } from '../interfaces/city.model';

@Injectable({
  providedIn: 'root',
})
export class CitiesApiService {
  private readonly apiUrl =
    'http://geodb-free-service.wirefreethought.com/v1/geo';

  constructor(private http: HttpClient) {}
  getCities(options: {
    countryCode?: string;
    namePrefix?: string;
    offset?: number;
    limit?: number;
  }): Observable<CitiesResponse> {
    let params = new HttpParams();

    if (options.countryCode) {
      params = params.set('countryIds', options.countryCode);
    }

    if (options.namePrefix) {
      params = params.set('namePrefix', options.namePrefix);
    }

    params = params.set('offset', (options.offset ?? 0).toString());
    params = params.set('limit', (options.limit ?? 5).toString());

    return this.http.get<CitiesResponse>(`${this.apiUrl}/cities`, { params });
  }

  // Получение данных о конкретном городе
  getCityDetails(cityId: string): Observable<City> {
    return this.http.get<City>(`${this.apiUrl}/cities/${cityId}`);
  }
}
