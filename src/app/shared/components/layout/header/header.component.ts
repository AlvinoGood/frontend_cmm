import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserMenuComponent } from './user-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [UserMenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
