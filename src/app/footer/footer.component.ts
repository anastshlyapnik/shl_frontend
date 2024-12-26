import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  constructor(private authService: AuthService, private router: Router) {}

 logout() {
  // Очистка данных пользователя (например, удаление токенов)
  localStorage.removeItem('auth_token');  // если использовался localStorage
  sessionStorage.removeItem('auth_token');  // если использовался sessionStorage
  
  // Очищаем все данные, связанные с пользователем, в сервисе (если нужно)
  this.authService.logout();  // Обязательно проверь, что метод в сервисе очищает все данные

  // Перезагрузка страницы
  window.location.reload();
}
}

