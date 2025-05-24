import { Component, OnInit, OnDestroy } from '@angular/core';
import { Student, StudentsService } from '../students.service';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';
import { SignalRService } from '../signalr.service';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxMaskDirective],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  searchQuery: string = '';  // Для хранения поискового запроса
  private refreshSubscription: Subscription | null = null;

  newStudent = {
    studentName: '',
    studentPhone: '',
    status: 0
  };

  editStudent: Partial<Student> = {};
  studentIdInput: number | null = null;
  deleteStudentId: number | null = null;


  adminPassword: string = '';

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
  ) { }

  loadStudents(): void {
    this.studentsService.getStudents().subscribe((data: Student[]) => {
      this.students = data;
      this.onSearch();
      console.log('Данные загружены:', data);
    });
  }

  ngOnInit(): void {
    this.signalRService.startConnection();

    this.signalRService.updates$.subscribe(() => {
      this.loadStudents();
    });

    this.loadStudents();
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  addStudent(): void {
    const phoneWithPrefix = `+7${this.newStudent.studentPhone.replace(/\D/g, '')}`;

    const studentData: Student = {
      studentId: 0, // Сервер назначит id
      studentName: this.newStudent.studentName,
      studentPhone: phoneWithPrefix,
      status: this.newStudent.status,
      checkInStart: null,
      checkInEnd: null,
      checkInTime: null,
      
    };

    this.studentsService.addStudent(studentData).subscribe(
      (newStudent) => {
        console.log('Студент добавлен:', newStudent);
        this.students.push(newStudent);
        this.resetForm();
      },
      (error) => {
        console.error('Ошибка при добавлении студента:', error);
      }
    );
  }

  resetForm(): void {
    this.newStudent = {
      studentName: '',
      studentPhone: '',
      status: 0
    };
  }

  getStatusText(status: number): string {
    return this.statusMapping[status] || 'Неизвестный статус';
  }

  formatTime(time: string | null): string | null {
    if (!time) {
      return null;
    }
    const date = new Date(time);
    date.setHours(date.getHours() + 3);  // Добавляем 3 часа
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  formatDuration(duration: string | null): string | null {
    if (!duration) return null;
    return duration.split('.')[0]; // Отрезаем миллисекунды
  }

  onChangeStatus(studentId: number, newStatus: number): void {
    console.log(`Выбран статус ${newStatus} для студента ${studentId}`);

    this.studentsService.updateStudentStatus(studentId, newStatus).subscribe({
      next: () => {
        console.log(`Статус студента ${studentId} обновлён`);

        if (newStatus === 2) {
          console.log('Отправляем запрос на установку CheckInStart');
          this.studentsService.updateCheckInStart(studentId).subscribe({
            next: () => console.log(`CheckInStart установлен для ${studentId}`),
            error: (err) => console.error(`Ошибка при установке CheckInStart:`, err)
          });
        }

        if (newStatus === 3) {
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

  onSearch(): void {
    if (this.searchQuery) {
      this.filteredStudents = this.students
        .filter((student) =>
          student.studentName.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
        .sort((a, b) => a.studentId - b.studentId); // сортировка по studentId
    } else {
      this.filteredStudents = this.students
        .slice()
        .sort((a, b) => a.studentId - b.studentId);
    }
  }

  // --- Добавленные методы для редактирования и удаления ---

  loadStudentById() {
    if (!this.studentIdInput) {
      alert('Введите ID студента');
      return;
    }

    this.studentsService.getStudent(this.studentIdInput).subscribe({
      next: (student) => {
        if (!student) {
          alert('Студент не найден');
          this.editStudent = {};
          return;
        }
        this.editStudent = {
          studentId: student.studentId,
          studentName: student.studentName ?? '',
          studentPhone: student.studentPhone ?? '',
          status: student.status,
          checkInStart: student.checkInStart,
          checkInEnd: student.checkInEnd,
          checkInTime: student.checkInTime,
        };
      },
      error: () => {
        alert('Ошибка загрузки студента');
        this.editStudent = {};
      }
    });
  }

  saveStudent() {
    if (!this.editStudent.studentName?.trim() || !this.editStudent.studentPhone?.trim()) {
      alert('Имя и телефон не могут быть пустыми');
      return;
    }
    if (!this.editStudent.studentId) {
      alert('ID студента отсутствует');
      return;
    }
    if (this.editStudent.studentPhone && !this.editStudent.studentPhone.startsWith('+')) {
      this.editStudent.studentPhone = '+' + this.editStudent.studentPhone;
    }

    this.studentsService.updateStudent(this.editStudent.studentId, this.editStudent).subscribe({
      next: () => alert('Данные студента обновлены'),
      error: () => alert('Ошибка при сохранении данных')
    });
  }


  deleteStudent(studentId: number): void {
    const userLogin = localStorage.getItem('user');
  
    if (userLogin !== 'admin') {
      alert('Удалять студентов может только администратор!');
      return;
    }
  
    if (!confirm('Вы уверены, что хотите удалить этого студента?')) {
      return;
    }
  
    this.studentsService.deleteStudent(studentId).subscribe({
      next: () => {
        alert('Студент удалён');
        this.editStudent = {};
        this.loadStudents();
      },
      error: (err) => {
        console.error('Ошибка при удалении студента:', err);
        alert('Не удалось удалить студента');
      }
    });
  }
  

}
