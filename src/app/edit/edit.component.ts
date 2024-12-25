import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  students: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    // Загружаем список студентов
    this.http.get<any[]>('/api/students').subscribe((data) => {
      this.students = data;
    });
  }

  // Метод для изменения статуса студента
  changeStatus(studentId: number, status: number): void {
    const url = `/api/Students/ChangeStatus/${studentId}`;
    const body = { status: status };

    // Отправляем PUT запрос для изменения статуса
    this.http.put(url, body).subscribe((response) => {
      console.log('Статус обновлен:', response);
      // Обновить статус в таблице после изменения
      const student = this.students.find(s => s.id === studentId);
      if (student) {
        student.status = status; // Обновляем статус студента
      }
    });
  }
}
