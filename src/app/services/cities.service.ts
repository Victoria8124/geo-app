import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CityModel } from '../interfaces/city.model';
import { PaginationResponse } from '../interfaces/pagination-response.model';

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
  }): Observable<PaginationResponse<CityModel>> {
    let params = new HttpParams();

    if (options.countryCode) {
      params = params.set('countryIds', options.countryCode);
    }

    if (options.namePrefix) {
      params = params.set('namePrefix', options.namePrefix);
    }

    params = params.set('offset', (options.offset ?? 0).toString());
    params = params.set('limit', (options.limit ?? 5).toString());

    return this.http.get<PaginationResponse<CityModel>>(
      `${this.apiUrl}/cities`,
      {
        params,
      },
    );
  }

  // Получение данных о конкретном городе
  getCityDetails(cityId: string): Observable<CityModel> {
    return this.http.get<CityModel>(`${this.apiUrl}/cities/${cityId}`);
  }
}
