import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
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
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  loading = signal(true);
  usersCount = signal(0);
  servicesCount = signal(0);
  ticketsCount = signal(0);
  encountersCount = signal(0);
  onlyMine = signal(false);
  doctorDni: string | null = null;

  ngOnInit(): void {
    const profile: any = this.auth.session().profile;
    this.doctorDni = profile?.dni ?? null;
    const data = this.route.snapshot.data as any;
    this.onlyMine.set(!!data?.onlyMine);
    forkJoin({
      users: this.usersSvc.list(1, 0),
      services: this.servicesSvc.list(1, 0),
      tickets: this.paymentsSvc.listTickets(),
      encounters: this.encountersSvc.list(),
    }).subscribe(({ users, services, tickets, encounters }) => {
      this.usersCount.set(users.total ?? 0);
      this.servicesCount.set(services.total ?? 0);
      this.ticketsCount.set(tickets.total ?? 0);
      if (this.onlyMine() && this.doctorDni) {
        const items = (encounters.items ?? []) as any[];
        const mine = items.filter((e: any) => (e.provider?.dni ?? e.providerDni) === this.doctorDni);
        this.encountersCount.set(mine.length);
      } else {
        this.encountersCount.set(encounters.total ?? 0);
      }
      this.loading.set(false);
    });
  }
}
