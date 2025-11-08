import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { Alert } from '../../../../core/models/alert.model';
import type { AlertType } from '../../../../core/enums/alert-type';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  private readonly alerts = inject(AlertService);

  alert = input.required<Alert>();

  containerClasses = computed(() => {
    const a = this.alert();
    const base =
      'w-full rounded-lg border p-4 text-sm shadow-sm transition-all ease-in-out pointer-events-auto bg-white';
    const state = this.stateClasses(a.uiState);
    return base + ' ' + this.variantClasses(a.type) + ' ' + state;
  });

  closeBtnClasses = computed(() => {
    const type = this.alert().type;
    switch (type) {
      case 'info':
        return 'ms-auto -mx-1.5 -my-1.5 bg-blue-50 text-blue-500 rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8';
      case 'success':
        return 'ms-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8';
      case 'warning':
        return 'ms-auto -mx-1.5 -my-1.5 bg-yellow-50 text-yellow-500 rounded-lg focus:ring-2 focus:ring-yellow-400 p-1.5 hover:bg-yellow-200 inline-flex items-center justify-center h-8 w-8';
      case 'error':
      default:
        return 'ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8';
    }
  });

  private variantClasses(type: AlertType): string {
    switch (type) {
      case 'info':
        return 'text-blue-800 bg-blue-50 border-blue-300';
      case 'success':
        return 'text-green-800 bg-green-50 border-green-300';
      case 'warning':
        return 'text-yellow-800 bg-yellow-50 border-yellow-300';
      case 'error':
      default:
        return 'text-red-800 bg-red-50 border-red-300';
    }
  }

  onClose(): void {
    this.alerts.closeAnimated(this.alert().id);
  }

  private stateClasses(state: Alert['uiState']): string {
    switch (state) {
      case 'entering':
        return 'opacity-0 translate-y-1 duration-500';
      case 'leaving':
        return 'opacity-0 -translate-y-1 duration-800';
      case 'visible':
      default:
        return 'opacity-100 translate-y-0';
    }
  }
}
