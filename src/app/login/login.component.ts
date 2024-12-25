import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service.js';


@Component({
  selector: 'app-login',
  standalone: true, // Указываем, что это standalone-компонент
  imports: [CommonModule, FormsModule], // Подключаем необходимые модули
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginData = {
    username: '',
    password: ''
  };

  onSubmit() {
    console.log('Логин:', this.loginData.username);
    console.log('Пароль:', this.loginData.password);
  }


  public msg:string | undefined;
  constructor(private _auth:AuthService ) { }

  ngOnInit(): void {
    this.ResetMsg();
  }

  public ResetMsg():void{
    this.msg = "Log in to continue";
  }
  public Login(info: { login: string, password: string }) {
     this._auth.login(JSON.parse(JSON.stringify(info))).subscribe(
       status=>
       {
         if (status==200)
         {
           this.msg = "Success";
           
         }
         else if (status==401)
           this.msg = "Wrong login/password";
         else
           this.msg = `Something went wrong (${status})`;
       });
  }
}
