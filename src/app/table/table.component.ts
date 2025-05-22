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
      this.tableData = data.sort((a, b) => a.id - b.id);
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
}
