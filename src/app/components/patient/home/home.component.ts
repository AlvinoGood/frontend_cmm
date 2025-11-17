import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientHomeComponent {

  constructor(private router: Router) { }

  title = 'Especialidades y horarios';
  sections = [
    {
      subtitle: 'Laboratorio Clínico',
      icon: 'fa-vial',
      bgColors: 'from-sky-50 via-white to-sky-100',
      fields: [
        {
          name: 'Entrega y toma de muestras',
          description:
            'Servicio para la recepción y procesamiento de muestras, con un manejo cuidadoso y adecuado para sus análisis.',
        },
        { name: 'Horario', description: '7:45 a.m. a 11:30 a.m.' },
      ],
    },
    {
      subtitle: 'Caja',
      icon: 'fa-cash-register',
      bgColors: 'from-emerald-50 via-white to-emerald-100',
      fields: [
        {
          name: 'Pago de servicios, carnets, certificados, consultas',
          description:
            'Realice sus pagos aquí para trámites de servicios, carnets, certificados y consultas.',
        },
        { name: 'Horario', description: '7:45 a.m. a 14:30 p.m.' },
      ],
    },
    {
      subtitle: 'Admisión y entrega de carnet',
      icon: 'fa-id-card',
      bgColors: 'from-amber-50 via-white to-amber-100',
      fields: [
        {
          name: 'Carnet médico',
          description:
            'Nuestro personal le asistirá con los requisitos y el proceso para acceder al servicio.',
        },
        { name: 'Horario', description: '7:45 a.m. a 15:00 p.m.' },
      ],
    },
    {
      subtitle: 'Consultorio de medicina',
      icon: 'fa-stethoscope',
      bgColors: 'from-indigo-50 via-white to-indigo-100',
      fields: [
        {
          name: 'Consultas médicas, certificados médicos',
          description:
            'Atención para consultas médicas y emisión de certificados médicos.',
        },
        { name: 'Horario', description: '8:00 a.m. a 16:00 p.m.' },
      ],
    },
    {
      subtitle: 'Consultorio odontología',
      icon: 'fa-tooth',
      bgColors: 'from-rose-50 via-white to-rose-100',
      fields: [
        {
          name: 'Curaciones, profilaxis, endodoncia',
          description:
            'Servicios de curaciones, profilaxis y tratamientos como endodoncias.',
        },
        { name: 'Horario', description: '8:00 a.m. a 15:00 p.m.' },
      ],
    },
    {
      subtitle: 'Servicios de enfermería',
      icon: 'fa-user-nurse',
      bgColors: 'from-teal-50 via-white to-teal-100',
      fields: [
        {
          name: 'Triaje, toma de presión arterial, curaciones',
          description:
            'El equipo de enfermería realiza triaje, toma de presión arterial y curaciones.',
        },
        { name: 'Horario', description: '8:00 a.m. a 15:00 p.m.' },
      ],
    },
  ];

  goToServices(): void {
    this.router.navigate(['/app/services']);
  }

}
