import type { AlertType } from '../enums/alert-type';

export interface Alert {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;
  autoClose?: boolean;
  closable?: boolean;
  createdAt: number;
  uiState?: 'entering' | 'visible' | 'leaving';
}
