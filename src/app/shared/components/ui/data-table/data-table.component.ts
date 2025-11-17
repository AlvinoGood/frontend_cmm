import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DataTableHeader {
  label: string;
  key?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  // Data & columns
  @Input() headers: DataTableHeader[] = [];
  @Input() rows: any[] = [];
  @Input() showActions = false;
  @Input() showPromote = false;
  @Input() showView = true;
  @Input() showEdit = true;
  @Input() showDelete = true;
  @Input() showBuy = false;

  // Search & pagination (headless)
  @Input() total = 0;
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() searchTerm = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

  // Row actions
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() promote = new EventEmitter<any>();
  @Output() buy = new EventEmitter<any>();

  private searchTimer: any;
  onSearchInput(ev: Event) {
    const value = (ev.target as HTMLInputElement)?.value ?? '';
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.searchChange.emit(value);
    }, 1500);
  }

  prevPage() {
    if (this.pageIndex > 0) this.pageChange.emit(this.pageIndex - 1);
  }
  nextPage() {
    if ((this.pageIndex + 1) * this.pageSize < this.total) this.pageChange.emit(this.pageIndex + 1);
  }

  get startItem(): number {
    return this.total === 0 ? 0 : this.pageIndex * this.pageSize + 1;
    }
  get endItem(): number {
    const end = this.pageIndex * this.pageSize + this.rows.length;
    return end > this.total ? this.total : end;
  }
}
