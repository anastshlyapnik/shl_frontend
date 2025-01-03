import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { HttpClient, HttpResponse } from '@angular/common/http';

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

  constructor(private authService: AuthService) {}

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
      this.msg = 'Вы уже вошли в систему.';
    } else {
      this.isLoggedIn = false;
      this.msg = 'Введите логин и пароль для авторизации.';
    }
  }

  /**
   * Отправка данных для авторизации
   */
 onSubmit(): void {
  if (this.isLoggedIn) {
    this.msg = 'Вы уже авторизованы.';
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

        // Используем реальный токен из ответа
        this.authService.login(info).subscribe(response => {
          
        });
      } else if (status === 401) {
        this.msg = 'Неверный логин или пароль.';
      } else {
        this.msg = `Ошибка авторизации (${status}).`;
      }
    },
    (error) => {
      this.msg = 'Произошла ошибка при попытке авторизации.';
    }
  );
  }
}

