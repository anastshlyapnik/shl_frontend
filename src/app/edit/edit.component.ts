import { Component, OnInit, OnDestroy } from '@angular/core';
import { Student, StudentsService } from '../students.service';
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
  newStudent = {
    studentName: '',
    studentPhone: '',
    status: 0  // Ожидайте
  };

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

addStudent(): void {
  const studentData: Student = {
    id: 0,  // ID будет назначен на сервере
    studentName: this.newStudent.studentName,
    studentPhone: parseFloat(this.newStudent.studentPhone),
    status: this.newStudent.status,  // status будет числом
    checkInStart: null,  // Устанавливаем в null
    checkInEnd: null,    // Устанавливаем в null
    checkInTime: null, 
    volunteerId: null,
  };

  this.studentsService.addStudent(studentData).subscribe(
    (newStudent) => {
      console.log('Студент добавлен:', newStudent);
      this.students.push(newStudent);  // Добавляем нового студента в массив
      this.resetForm();  // Очищаем форму после успешного добавления
    },
    (error) => {
      console.error('Ошибка при добавлении студента:', error);
    }
  );
}

  // Метод для сброса формы
  resetForm(): void {
    this.newStudent = {
      studentName: '',
      studentPhone: '',
      status: 0
    };
  }
  
  // Метод для отображения статуса
  getStatusText(status: number): string {
    return this.statusMapping[status] || 'Неизвестный статус';
  }

  // Метод для добавления 3 часов к времени и форматирования с проверкой на null
formatTime(time: string | null): string | null {
  if (time === null || time === undefined) {
    
    return null;
    // Если значение равно null или undefined, возвращаем null
  }

  const date = new Date(time);
  date.setHours(date.getHours() + 3); // Добавляем 3 часа
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
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

  // Обновляем статус студента
  this.studentsService.updateStudentStatus(studentId, status).subscribe(
    () => {
      console.log(`Статус для студента с ID ${studentId} изменён на ${status}`);
      const student = this.students.find((s) => s.id === studentId);
      if (student) {
        student.status = status; // Обновляем статус в массиве студентов
      }

      // Если статус обновился на "CheckInStart", отправляем запрос на CheckInStart
      if (actionId === 2 && checkbox.checked) {
        this.studentsService.updateCheckInStart(studentId).subscribe(
          () => {
            console.log(`Студент с ID ${studentId} начал заселение.`);
          },
          (error) => {
            console.error(`Ошибка при обновлении времени заселения для студента ${studentId}:`, error);
          }
        );
      }

      // Если статус обновился на "CheckInEnd", отправляем запрос на CheckInEnd
      if (actionId === 3 && checkbox.checked) {
        this.studentsService.updateCheckInEnd(studentId).subscribe(
          () => {
            console.log(`Студент с ID ${studentId} завершил заселение.`);
          },
          (error) => {
            console.error(`Ошибка при завершении заселения для студента ${studentId}:`, error);
          }
        );
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
