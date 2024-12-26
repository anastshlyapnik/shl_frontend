import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Md5 } from 'ts-md5';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
     private apiUrl = 'https://localhost:7169/api/auth';
  constructor(private _http: HttpClient) {}

  public login(info: { login: string; password: string }): Observable<number> {
  info.password = Md5.hashStr(info.password) as string;

  return this._http.post<any>(`${this.apiUrl}/`, info, { observe: 'response' }).pipe(
    map((res) => {
      if (res.status == 200) {
        const token = res.body.token;
        console.log('Received token:', token); // Логируем токен для проверки
        localStorage.setItem('token', token); // Сохраняем токен
        localStorage.setItem('user', info.login); // Сохраняем логин
      }
      return res.status;
    }),
    catchError((error) => {
      return of((error as HttpResponse<any>).status);
    })
  );
}

  public logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
