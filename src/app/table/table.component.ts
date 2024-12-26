import { Component, OnInit, OnDestroy } from '@angular/core';
import { StudentsService } from '../students.service';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router';
import { Subscription, interval } from 'rxjs';

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
  autoRefreshSubscription!: Subscription; // Для управления автообновлением

  statusMapping: { [key: number]: string } = {
    0: 'Ожидайте',
    1: 'Поднимайтесь',
    2: 'Заселяется',
    3: 'Заселен',
  };

  constructor(private studentsService: StudentsService) {}

  ngOnInit(): void {
    this.fetchData();

    // Настраиваем автообновление данных каждые 3 секунды
    this.autoRefreshSubscription = interval(3000).subscribe(() => {
      this.fetchData();
      console.log('Данные обновлены:');
    });
  }

  // Загружаем данные из сервиса
  fetchData(): void {
    this.studentsService.getStudents().subscribe((data) => {
      this.tableData = data; 
      this.onStatusChange(); // Применяем фильтрацию после обновления данных
    });
  }

  getStatusText(status: number): string {
    return this.statusMapping[status] || 'Неизвестный статус';
  }

  onStatusChange(): void {
    if (this.selectedStatus === 'all') {
      this.filteredData = this.tableData;
    } else {
      this.filteredData = this.tableData.filter(
        (student) => student.status.toString() === this.selectedStatus
      );
    }
  }

  // Метод для сортировки по столбцу
  sortData(column: string): void {
    this.filteredData.sort((a, b) => {
      if (a[column] < b[column]) {
        return -1;
      } else if (a[column] > b[column]) {
        return 1;
      }
      return 0;
    });
  }

  // Очищаем подписку на автообновление при уничтожении компонента
  ngOnDestroy(): void {
    if (this.autoRefreshSubscription) {
      this.autoRefreshSubscription.unsubscribe();
    }
  }
}
