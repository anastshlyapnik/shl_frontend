import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true, // Указываем, что это standalone-компонент
  imports: [CommonModule, FormsModule], // Подключаем необходимые модули
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    username: '',
    password: ''
  };

  onSubmit() {
    console.log('Логин:', this.loginData.username);
    console.log('Пароль:', this.loginData.password);
  }
}
