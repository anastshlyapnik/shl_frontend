import { Component, OnInit, OnDestroy } from '@angular/core';
import { StudentsService } from '../students.service';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy {
  students: any[] = [];
  filteredStudents: any[] = [];
  searchQuery: string = '';  // Для хранения поискового запроса
  private refreshSubscription: Subscription | null = null;

  statusMapping: { [key: number]: string } = {
    0: 'Ожидайте',
    1: 'Поднимайтесь',
    2: 'Заселяется',
    3: 'Заселен',
  };

  constructor(
    private studentsService: StudentsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Запуск автообновления каждые 3 секунды
    this.refreshSubscription = interval(3000)
      .pipe(
        switchMap(() => this.studentsService.getStudents()) // Делает запрос к бэкенду
      )
      .subscribe((data) => {
        this.students = data; // Обновляет данные в таблице
        this.filteredStudents = data; // Изначально фильтруем всех студентов
        console.log('Данные обновлены:', data);
      });
  }

  ngOnDestroy(): void {
    // Отписываемся от обновления, чтобы избежать утечек памяти
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  // Метод для отображения статуса
  getStatusText(status: number): string {
    return this.statusMapping[status] || 'Неизвестный статус';
  }

  // Метод для изменения статуса студента по чекбоксу
  onChangeStatus(studentId: number, actionId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const status = checkbox.checked ? actionId : -1;

    // Проверка studentId
    if (!studentId) {
      console.error('Ошибка: ID студента не определён!');
      return;
    }

    this.studentsService.updateStudentStatus(studentId, status).subscribe(
      () => {
        console.log(`Статус для студента с ID ${studentId} изменён на ${status}`);
        const student = this.students.find((s) => s.id === studentId);
        if (student) {
          student.status = status; // Обновляем статус в массиве студентов
        }
      },
      (error) => {
        console.error(`Ошибка изменения статуса для студента ${studentId}:`, error);
      }
    );
  }

  // Поиск студентов по имени
  onSearch(): void {
    if (this.searchQuery) {
      this.filteredStudents = this.students.filter((student) =>
        student.studentName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredStudents = this.students; // Если запрос пустой, показываем всех
    }
  }
}
