import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private updatesSubject = new Subject<void>();
  public updates$ = this.updatesSubject.asObservable();
  private isRegisteredEvents = false; // флаг, чтобы регистрировать события один раз

  public startConnection(): void {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      // Уже подключены — не создаём новое соединение
      return;
    }

    if (!this.hubConnection) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.apiUrl}/studentHub`, { withCredentials: true })
        .withAutomaticReconnect()
        .build();
    }

    this.hubConnection
      .start()
      .then(() => {
        console.log('SignalR соединение установлено');
        if (!this.isRegisteredEvents) {
          this.registerOnServerEvents();
          this.isRegisteredEvents = true;
        }
      })
      .catch(err => console.error('Ошибка подключения к SignalR:', err));
  }

  private registerOnServerEvents(): void {
    // Удаляем предыдущий обработчик, если есть (только если у тебя версия SignalR поддерживает off)
    this.hubConnection.off('StudentsUpdated');

    this.hubConnection.on('StudentsUpdated', () => {
      console.log('Получено событие от SignalR: StudentsUpdated');
      this.updatesSubject.next();
    });
  }
}
