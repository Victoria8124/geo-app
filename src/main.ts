import { provideEventPlugins } from "@taiga-ui/event-plugins";
import { provideAnimations } from "@angular/platform-browser/animations";
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Импортируем FormsModule


bootstrapApplication(AppComponent, {
  providers: [
        provideAnimations(),
        provideRouter(routes),
    provideHttpClient(), // Добавляем HttpClient для API-запросов
    FormsModule,
        provideEventPlugins()
    ],
}).catch((err) => console.error(err));

