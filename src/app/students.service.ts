import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Student {
  id: number;
  fullName: string;
  phoneNumber: string;
  status: string;  // Пример: 'Ожидайте', 'Заселен'
  checkInStart: string;
  checkInEnd: string;
  checkInTime: string;
  volunteerId: number;
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

  // Добавить нового студента
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
  return this.http.put<void>(`${this.apiUrl}/ChangeStatus/${id}`, status, {
    headers: new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    }),
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
