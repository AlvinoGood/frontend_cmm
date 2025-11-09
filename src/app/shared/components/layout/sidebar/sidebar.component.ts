import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { SidebarItemComponent } from './sidebar-item.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SidebarItemComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly svc = inject(SidebarService);
  readonly items = computed(() => this.svc.items());
}

