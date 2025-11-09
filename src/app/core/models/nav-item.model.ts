export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  roles?: Array<'user' | 'medical' | 'admin'>;
  badge?: number | string;
  children?: NavItem[];
}

