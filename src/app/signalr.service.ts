import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
    private hubConnection!: signalR.HubConnection;
  private updatesSubject = new Subject<void>();
  public updates$ = this.updatesSubject.asObservable();

    public startConnection(): void {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.apiUrl}/studentHub`, {
                withCredentials: true // обязательно если используешь авторизацию
            })
            .withAutomaticReconnect()
            .build();

            this.hubConnection
            .start()
            .then(() => {
              console.log('SignalR соединение установлено');
              this.registerOnServerEvents(); // Важно!
            })
            .catch(err => console.error('Ошибка подключения к SignalR:', err));
        }
      
        private registerOnServerEvents(): void {
          this.hubConnection.on('StudentsUpdated', () => {
            console.log('Получено событие от SignalR: StudentsUpdated');
            this.updatesSubject.next(); // Извещаем всех подписчиков
          });
        }
  }

