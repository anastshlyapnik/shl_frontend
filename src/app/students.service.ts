import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Student {
  id: number;
  studentName: string;
  studentPhone: string;
  status: number;  // Убедитесь, что это число
  checkInStart: string | null;
  checkInEnd: string | null;
  checkInTime: string | null;  // Убедитесь, что это строка или null
  callTime?: string;
}


@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  private apiUrl = 'https://localhost:7169/api/students'; // URL API для "Students"

  constructor(private http: HttpClient) {}

  // Получить всех студентов
  getStudents(): Observable<Student[]> {
    const headers = this.getAuthHeaders();  // Получаем заголовки с токеном
    return this.http.get<Student[]>(this.apiUrl, { headers });
  }

  addStudent(student: Partial<Student>): Observable<Student> {
    const headers = this.getAuthHeaders();
    return this.http.post<Student>(this.apiUrl, student, { headers });
  }


  // Обновить данные студента
  updateStudent(id: number, updatedStudent: Partial<Student>): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.put<void>(`${this.apiUrl}/${id}`, updatedStudent, { headers });
  }

  // Обновить только статус студента
  updateStudentStatus(id: number, status: number): Observable<void> {
  return this.http.put<void>(
    `${this.apiUrl}/ChangeStatus/${id}`,
    status, // отправляем просто число, как требует сервер
    {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    }
  );
}



// Добавляем методы для CheckInStart и CheckInEnd
updateCheckInStart(id: number): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/CheckInStart/${id}`, null, {
    headers: this.getAuthHeaders(),
  });
}

updateCheckInEnd(id: number): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/CheckInEnd/${id}`, null, {
    headers: this.getAuthHeaders(),
  });
}

downloadReport(): Observable<Blob> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/Export`, {
      headers,
      responseType: 'blob'
    });
  }


  // Удалить студента
  deleteStudent(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  // Получить заголовки с токеном
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');  // Получаем токен из localStorage
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Добавляем токен в заголовки
    });
  }
}
