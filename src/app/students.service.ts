import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Student {
  id: number;
  fullName: string;
  phoneNumber: string;
  status: string; // Пример: 'Ожидайте', 'Заселен'
}

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  private apiUrl = 'https://localhost:7169/api/students'; // URL API для "Students"

  constructor(private http: HttpClient) {}

  // Получить всех студентов
  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  // Добавить нового студента
  addStudent(student: Partial<Student>): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student);
  }

  // Обновить данные студента
  updateStudent(id: number, updatedStudent: Partial<Student>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, updatedStudent);
  }

  // Удалить студента
  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
