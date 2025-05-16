import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { TableComponent } from './app/table/table.component';
import { LoginComponent } from './app/login/login.component';
import { HomeComponent } from './app/home/home.component'; 
import { EditComponent } from './app/edit/edit.component';
import { HeaderComponent } from './app/header/header.component';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthGuard } from './app/auth.guard';

// 🧩 Для форм и масок
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideNgxMask } from 'ngx-mask';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'table', component: TableComponent },
  { path: 'edit', component: EditComponent ,canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'home' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    provideAnimationsAsync('noop'),
    importProvidersFrom(FormsModule),
    provideNgxMask()
  ],
}).catch((err) => console.error(err));
