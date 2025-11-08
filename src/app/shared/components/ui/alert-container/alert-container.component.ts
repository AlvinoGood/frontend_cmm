import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AlertService } from '../../../../core/services/alert.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-alert-container',
  templateUrl: './alert-container.component.html',
  styleUrl: './alert-container.component.scss',
  imports: [AlertComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertContainerComponent {
  private readonly alertsSvc = inject(AlertService);
  alerts = computed(() =>
    [...this.alertsSvc.alerts()].sort((a, b) => b.createdAt - a.createdAt)
  );
}

