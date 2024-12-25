import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TableComponent } from './table/table.component';
import { EditComponent } from './edit/edit.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'table', component: TableComponent },
    { path: 'edit', component: EditComponent },
    { path: 'login', component: LoginComponent },
    { path: '**', redirectTo: 'home' } ]
