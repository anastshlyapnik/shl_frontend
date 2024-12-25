import { Component, OnInit } from '@angular/core';
import { StudentsService } from '../students.service';
import { CommonModule } from '@angular/common'; // Добавим CommonModule

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule], // Подключаем CommonModule
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  tableData: any[] = [];

  constructor(private studentsService: StudentsService) {}

  ngOnInit(): void {
    // Получаем студентов при инициализации компонента
    this.studentsService.getStudents().subscribe((data) => {
      this.tableData = data; // Заполняем массив данными из бэкэнда
    });
  }
}
