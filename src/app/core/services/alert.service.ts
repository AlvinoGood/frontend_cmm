import { Injectable, signal } from '@angular/core';
import { uid } from '../helpers/uid';
import type { Alert } from '../models/alert.model';
import type { AlertType } from '../enums/alert-type';
import type { AlertOptions } from '../models/alert-options.model';

@Injectable({ providedIn: 'root' })
export class AlertService {
  readonly alerts = signal<Alert[]>([]);
  private timers = new Map<string, { entry?: any; visible?: any; remove?: any }>();
  private readonly entryMs = 500;
  private readonly visibleMsDefault = 2000;
  private readonly exitMs = 800;

  show(options: AlertOptions): string {
    const id = uid();
    const duration = options.duration ?? 3000;
    const autoClose = options.autoClose ?? true;
    const closable = options.closable ?? true;

    const alert: Alert = {
      id,
      type: options.type,
      title: options.title,
      message: options.message,
      duration,
      autoClose,
      closable,
      createdAt: Date.now(),
      uiState: 'entering',
    };
    this.alerts.update((list) => [alert, ...list]);
    this.scheduleEntryAndAutoDismiss(id, autoClose, duration);
    return id;
  }

  success(message: string, opts: Omit<AlertOptions, 'type' | 'message'> = {}): string {
    return this.show({ type: 'success', message, ...opts });
  }

  error(message: string, opts: Omit<AlertOptions, 'type' | 'message'> = {}): string {
    return this.show({ type: 'error', message, ...opts });
  }

  warning(message: string, opts: Omit<AlertOptions, 'type' | 'message'> = {}): string {
    return this.show({ type: 'warning', message, ...opts });
  }

  info(message: string, opts: Omit<AlertOptions, 'type' | 'message'> = {}): string {
    return this.show({ type: 'info', message, ...opts });
  }

  close(id: string): void {
    const timers = this.timers.get(id);
    if (timers) {
      if (timers.entry) clearTimeout(timers.entry);
      if (timers.visible) clearTimeout(timers.visible);
      if (timers.remove) clearTimeout(timers.remove);
      this.timers.delete(id);
    }
    this.alerts.update((list) => list.filter((a) => a.id !== id));
  }

  closeAnimated(id: string): void {
    const timers = this.timers.get(id) ?? {};
    if (timers.entry) clearTimeout(timers.entry);
    if (timers.visible) clearTimeout(timers.visible);
    this.setState(id, 'leaving');
    const remove = setTimeout(() => this.close(id), this.exitMs);
    this.timers.set(id, { ...timers, remove });
  }

  clear(): void {
    this.timers.forEach((timers) => {
      if (timers.entry) clearTimeout(timers.entry);
      if (timers.visible) clearTimeout(timers.visible);
      if (timers.remove) clearTimeout(timers.remove);
    });
    this.timers.clear();
    this.alerts.set([]);
  }

  private scheduleEntryAndAutoDismiss(id: string, autoClose: boolean, duration?: number): void {
    const entry = setTimeout(() => {
      this.setState(id, 'visible');
      if (autoClose) {
        const visible = setTimeout(() => {
          this.setState(id, 'leaving');
          const remove = setTimeout(() => this.close(id), this.exitMs);
          const current = this.timers.get(id) ?? {};
          this.timers.set(id, { ...current, remove });
        }, duration ?? this.visibleMsDefault);
        const current = this.timers.get(id) ?? {};
        this.timers.set(id, { ...current, visible });
      }
    }, this.entryMs);
    const current = this.timers.get(id) ?? {};
    this.timers.set(id, { ...current, entry });
  }

  private setState(id: string, uiState: Alert['uiState']): void {
    this.alerts.update((list) => list.map((a) => (a.id === id ? { ...a, uiState } : a)));
  }
}
