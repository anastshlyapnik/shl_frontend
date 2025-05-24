import { Component, OnInit, OnDestroy } from '@angular/core';
import { StudentsService } from '../students.service';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SignalRService } from '../signalr.service';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit, OnDestroy {
  tableData: any[] = [];
  filteredData: any[] = [];
  selectedStatus: string = 'all'; 
  private signalRSubscription!: Subscription;

  statusMapping: { [key: number]: string } = {
    0: 'Ожидайте',
    1: 'Поднимайтесь',
    2: 'Заселяется',
    3: 'Заселен',
  };

  manualStartTime = new Date('2024-05-22T09:00:00'); // Можно будет менять

  constructor(
    private studentsService: StudentsService, 
    private signalRService: SignalRService
  ) { }

  ngOnInit(): void {
    this.signalRService.startConnection();

    // Подписываемся на обновления от SignalR
    this.signalRSubscription = this.signalRService.updates$.subscribe(() => {
      console.log("SignalR: получено событие обновления студентов");
      this.fetchData();
    });

    this.fetchData(); // начальная загрузка
  }

  fetchData(): void {
    this.studentsService.getStudents().subscribe((data) => {
      // Сортируем по studentId по возрастанию
      this.tableData = data.sort((a, b) => a.studentId - b.studentId);
      this.calculateEstimatedTimes();
      console.log('Данные загружены и отсортированы по studentId:', this.tableData);
      this.onStatusChange(); // применить фильтр
    });
  }

  getStatusText(status: number): string {
    return this.statusMapping[status] || 'Неизвестный статус';
  }

  onStatusChange(): void {
    if (this.selectedStatus === 'all') {
      this.filteredData = this.tableData.slice(); // копируем массив
    } else {
      this.filteredData = this.tableData.filter(
        (student) => student.status.toString() === this.selectedStatus
      );
    }
  
    // Сортировка по id (по возрастанию)
    this.filteredData.sort((a, b) => a.studentId - b.studentId);
  }
  

  formatDuration(duration: string | null): string | null {
    if (!duration) return null;
    return duration.split('.')[0];
  }

  sortData(column: string): void {
    this.filteredData.sort((a, b) => {
      if (a[column] < b[column]) return -1;
      if (a[column] > b[column]) return 1;
      return 0;
    });
  }

  ngOnDestroy(): void {
    if (this.signalRSubscription) {
      this.signalRSubscription.unsubscribe();
    }
  }

  calculateEstimatedTimes(): void {
    console.log('⏳ Расчёт примерного времени вызова начат');
  
    const studentsWithCheckInTime = this.tableData.filter(s => s.checkInTime);
    console.log('✅ Студенты с checkInTime:', studentsWithCheckInTime);
  
    const avgDurationMs =
      studentsWithCheckInTime.length > 0
        ? studentsWithCheckInTime
            .map(s => this.parseDuration(s.checkInTime))
            .reduce((acc, val) => acc + val, 0) / studentsWithCheckInTime.length
        : 0;
  
    console.log('📊 Среднее время заселения (мин):', avgDurationMs/1000/60);
  
    const firstCheckInStart = this.tableData.find(s => s.checkInStart);
    const startTime = firstCheckInStart
      ? new Date(firstCheckInStart.checkInStart)
      : this.manualStartTime;
  
    console.log('🕒 Стартовое время заселения:', startTime);
  
    let position = 0;
  
    this.tableData.forEach((student, index) => {
      if (student.status === 0) {
        position++;
        const groupIndex = Math.floor(position / 5);
        const estimatedTime = new Date(startTime.getTime() + groupIndex * avgDurationMs);
        student.callTime = estimatedTime;
        console.log(`📌 Студент ID ${student.id}: позиция ${position}, вызов в ${estimatedTime}`);
      } else {
        student.callTime = null;
      }
    });
  }
  
  
  // Парсинг строки вида HH:mm:ss
  parseDuration(duration: string): number {
    const [h, m, s] = duration.split(':').map(Number);
    return ((h * 60 + m) * 60 + s) * 1000;
  }
  
}
