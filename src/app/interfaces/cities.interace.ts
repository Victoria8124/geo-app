export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface City {
  name: string;
  country: string;
  countryCode: string;
  region: string;
  population: number;
  latitude: number;
  longitude: number;
  timezone: string;
  type: string;
  id: string;
  deleted: boolean;
  wikiDataId: string;
}
export interface CitiesResponse {
  data: City[];
  metadata: {
    totalCount: number;
  };
}