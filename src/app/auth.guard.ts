import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user'); // Сохраняем логин после авторизации
    const allowedUsers = ['admin', 'volunteer'];

    if (token && allowedUsers.includes(user || '')) {
      return true; // Разрешён доступ
    } else {
      this.router.navigate(['/login']); // Перенаправление на страницу логина
      return false;
    }
  }
}
