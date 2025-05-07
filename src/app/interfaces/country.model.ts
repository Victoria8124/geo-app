export interface CountryModel {
wikiDataId?: string;    // Теперь это явное свойство
  currencyCodes?: string[]; // Это массив строк, так как мы используем `.join(', ')`
  id: string;
  name: string;
  code: string;
  currency: string;
  currencyCode: string;
}
