import type { AlertType } from '../enums/alert-type';

export interface AlertOptions {
  type: AlertType;
  message: string;
  title?: string;
  duration?: number;
  autoClose?: boolean;
  closable?: boolean;
}

