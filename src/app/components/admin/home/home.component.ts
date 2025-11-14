import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../core/services/users.service';
import { ServicesService } from '../../../core/services/services.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { EncountersService } from '../../../core/services/encounters.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHomeComponent implements OnInit {
  private readonly usersSvc = inject(UsersService);
  private readonly servicesSvc = inject(ServicesService);
  private readonly paymentsSvc = inject(PaymentsService);
  private readonly encountersSvc = inject(EncountersService);

  loading = signal(true);
  usersCount = signal(0);
  servicesCount = signal(0);
  ticketsCount = signal(0);
  encountersCount = signal(0);

  ngOnInit(): void {
    forkJoin({
      users: this.usersSvc.list(1, 0),
      services: this.servicesSvc.list(1, 0),
      tickets: this.paymentsSvc.listTickets(),
      encounters: this.encountersSvc.list(),
    }).subscribe(({ users, services, tickets, encounters }) => {
      this.usersCount.set(users.total ?? 0);
      this.servicesCount.set(services.total ?? 0);
      this.ticketsCount.set(tickets.total ?? 0);
      this.encountersCount.set(encounters.total ?? 0);
      this.loading.set(false);
    });
  }
}

