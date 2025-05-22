import { Component, OnInit, OnDestroy } from '@angular/core';
import { Student, StudentsService } from '../students.service';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NgxMaskDirective } from 'ngx-mask';
import { SignalRService } from '../signalr.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,NgxMaskDirective],
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

  statusOptions: number[] = [0, 1, 2, 3];


  constructor(
    private studentsService: StudentsService,
    private authService: AuthService, 
    private signalRService: SignalRService
  ) {}
  loadStudents(): void {
      this.studentsService.getStudents().subscribe((data) => {
        this.students = data;
        this.onSearch();
        console.log('Данные загружены:', data);
      });
    }
  //обновление страницы
  ngOnInit(): void {
    this.signalRService.startConnection();

  // Подписываемся на обновления от SignalR
  this.signalRService.updates$.subscribe(() => {
    this.loadStudents(); // загружаем студентов при событии
  });

  this.loadStudents(); // начальная загрузка      
  }

   ngOnDestroy(): void {
    // Отписываемся от обновления, чтобы избежать утечек памяти
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

addStudent(): void {
  const phoneWithPrefix = `+7${this.newStudent.studentPhone.replace(/\D/g, '')}`; // только цифры

  const studentData: Student = {
    id: 0,  // ID будет назначен на сервере
    studentName: this.newStudent.studentName,
    studentPhone: phoneWithPrefix,
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
    date.setHours(date.getHours()); 
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  formatDuration(duration: string | null): string | null {
    if (!duration) return null;
    // Пример: "00:02:33.1234567" → "00:02:33"
    return duration.split('.')[0];
}


  
  // Метод для изменения статуса студента 
  onChangeStatus(studentId: number, newStatus: number): void {
  console.log(`Выбран статус ${newStatus} для студента ${studentId}`);

  this.studentsService.updateStudentStatus(studentId, newStatus).subscribe({
    next: () => {
      console.log(`Статус студента ${studentId} обновлён`);

      if (newStatus == 2) {
        console.log('Отправляем запрос на установку CheckInStart');
        this.studentsService.updateCheckInStart(studentId).subscribe({
          next: () => console.log(`CheckInStart установлен для ${studentId}`),
          error: (err) => console.error(`Ошибка при установке CheckInStart:`, err)
        });
      }

      if (newStatus == 3) {
        console.log('Отправляем запрос на установку CheckInEnd');
        this.studentsService.updateCheckInEnd(studentId).subscribe({
          next: () => console.log(`CheckInEnd установлен для ${studentId}`),
          error: (err) => console.error(`Ошибка при установке CheckInEnd:`, err)
        });
      }
    },
    error: (error: any) => {
      console.error(`Ошибка изменения статуса для студента ${studentId}:`, error);
    }
  });
}


downloadReport(): void {
  this.studentsService.downloadReport().subscribe(
    (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Отчет о процессе заселения студентов.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    },
    (err: any) => {
      console.error('Ошибка при загрузке отчета:', err);
    }
  );
}


  // Поиск студентов по имени
  onSearch(): void {
  if (this.searchQuery) {
    this.filteredStudents = this.students
      .filter((student) =>
        student.studentName.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
      .sort((a, b) => a.studentId - b.studentId); // сортировка по ID
  } else {
    this.filteredStudents = this.students
      .slice() // копируем массив
      .sort((a, b) => a.studentId - b.studentId); // сортировка по ID
  }
}

}
