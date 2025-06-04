import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginData = {
    username: '',
    password: '',
  };

  public msg: string = '';
  public isLoggedIn: boolean = false;
 

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  /**
   * Проверяет, авторизован ли пользователь
   */
  checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
      this.msg = 'Выполнен вход в систему';
    } else {
      this.isLoggedIn = false;
      this.msg = 'Введите логин и пароль для авторизации';
    }
  }

  logout() {
    // Очистка данных пользователя (например, удаление токенов)
    localStorage.removeItem('auth_token');  // если использовался localStorage
    sessionStorage.removeItem('auth_token');  // если использовался sessionStorage
    
    // Очищаем все данные, связанные с пользователем, в сервисе (если нужно)
    this.authService.logout();  // Обязательно проверь, что метод в сервисе очищает все данные
  
    // Перезагрузка страницы
    window.location.reload();
  }

  /**
   * Отправка данных для авторизации
   */
  onSubmit(): void {
    if (this.isLoggedIn) {
      this.msg = 'Вы уже авторизованы';
      return;
    }

    const info = {
      login: this.loginData.username,
      password: this.loginData.password,
    };

    this.authService.login(info).subscribe(
      (status) => {
        if (status === 200) {
          this.msg = 'Успешная авторизация!';
          this.isLoggedIn = true;
          this.router.navigate(['edit']);
        } else if (status === 401) {
          this.msg = 'Неверный логин или пароль';
        } else if (status === 0) {
          this.msg = 'Ошибка сети или сервера';
        } else {
          this.msg = `Ошибка авторизации (${status})`;
        }
      },
      (error) => {
        this.msg = 'Произошла ошибка при попытке авторизации';
      }
    );
  }
}

