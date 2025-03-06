import { Routes } from '@angular/router';
import { CountriesComponent } from './pages/countries/countries.component';
import { CitiesComponent } from './pages/cities/cities.component';
import { NgModule } from '@angular/core';
import { RouterModule} from '@angular/router'; // Импортируем RouterModule и Routes

export const routes: Routes = [
  { path: '', redirectTo: 'countries', pathMatch: 'full' },
  { path: 'countries', component: CountriesComponent },
  { path: 'cities', component: CitiesComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)], // Подключаем маршруты
  exports: [RouterModule], // Экспортируем RouterModule, чтобы он был доступен в других модулях
})
export class AppRoutingModule {}