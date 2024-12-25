import { Component, OnInit } from '@angular/core';
import { StudentsService } from '../students.service';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule], 
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  tableData: any[] = [];
  filteredData: any[] = [];
  selectedStatus: string = 'all'; 


   statusMapping: { [key: number]: string } = {
    0: 'Ожидайте',
    1: 'Поднимайтесь',
    2: 'Заселяется',
    3: 'Заселен'
  };

  constructor(private studentsService: StudentsService) {}

  ngOnInit(): void {
    // Получаем студентов при инициализации компонента
    this.studentsService.getStudents().subscribe((data) => {
      this.tableData = data; 
      this.filteredData = data;
    });
  }
  getStatusText(status: number): string {
    return this.statusMapping[status] || 'Неизвестный статус';
  }
  onStatusChange(): void {
    if (this.selectedStatus === 'all') {
      this.filteredData = this.tableData;
    } else {
      this.filteredData = this.tableData.filter(student => student.status.toString() === this.selectedStatus);
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
}

