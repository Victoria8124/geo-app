import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-custom-paginator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-paginator.component.html',
  styleUrls: ['./custom-paginator.component.scss'],
})
export class CustomPaginatorComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  get pages(): number[] {
    const visiblePages = [];
    const maxVisiblePages = 5;
    const firstPagesCount = 2; 
    const lastPagesCount = 1; 

    if (this.totalPages <= maxVisiblePages) {
      // Если всего страниц меньше или равно 5, показываем все
      for (let i = 1; i <= this.totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      //  первые страницы
      for (let i = 1; i <= firstPagesCount; i++) {
        visiblePages.push(i);
      }

      // если есть сл стран, став многоточие
      if (this.currentPage > firstPagesCount + 1) {
        visiblePages.push(-1); // Многоточие
      }

      // Отображаем ближайшие страницы вокруг текущей
      const startPage = Math.max(firstPagesCount + 1, this.currentPage - 1);
      const endPage = Math.min(
        this.totalPages - lastPagesCount,
        this.currentPage + 1
      );

      for (let i = startPage; i <= endPage; i++) {
        visiblePages.push(i);
      }

      // Многоточие перед последними страницами, если необходимо
      if (this.currentPage < this.totalPages - lastPagesCount - 1) {
        visiblePages.push(-1); // Многоточие
      }

      // Показываем последние страницы
      for (
        let i = this.totalPages - lastPagesCount + 1;
        i <= this.totalPages;
        i++
      ) {
        visiblePages.push(i);
      }
    }

    return visiblePages;
  }

  onPageChange(page: number) {
    if (page === -1) return; // игнорируем многоточие
    this.pageChange.emit(page); // отправляем родительскому компоненту информацию о новой странице
  }
}