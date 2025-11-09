import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { AlertContainerComponent } from './shared/components/ui/alert-container/alert-container.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AlertContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  // protected readonly title = signal('frontend-centro-medico');
  title = 'web-app';
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    initFlowbite();
    this.auth.loadFromStorage();
  }

}
