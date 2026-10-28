import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { GestionReservaApiClient } from '../gestion/gestion-reserva-api-client';
import { hoyEnFormatoIso, mensajeDeError } from '../listado/reservas-listado';
import { type MedicoDTO, ReservarTurnoApiClient } from './reservar-turno-api-client';

// Devuelve la fecha de dentro de N días
function dentroDeDias(dias: number): Date {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

// (hz) Pantalla del paciente: reservar un turno
@Component({
  selector: 'app-reservar-turno',
  imports: [DatePipe, CurrencyPipe, RouterLink, ButtonModule, InputTextModule],
  templateUrl: './reservar-turno.html',
})
export class ReservarTurno {
  private readonly reservarTurnoApiClient = inject(ReservarTurnoApiClient);
  private readonly gestionReservaApiClient = inject(GestionReservaApiClient);
  private readonly mensajes = inject(MessageService);
  private readonly router = inject(Router);

  // Límites del calendario: desde hoy hasta 30 días (regla del TP)
  protected readonly fechaMinima = hoyEnFormatoIso();
  protected readonly fechaMaxima = hoyEnFormatoIso(dentroDeDias(30));

  protected readonly medicos = signal<MedicoDTO[]>([]);
  protected readonly idMedico = signal<number | null>(null);
  protected readonly fecha = signal('');
  protected readonly horarios = signal<string[]>([]);
  protected readonly horarioElegido = signal<string | null>(null);
  protected readonly cargandoHorarios = signal(false);
  protected readonly enviando = signal(false);

  //--------nuevo: señales para los pacientes activos-------------------------

  protected readonly pacientes = signal<any[]>([]);
  protected readonly idPacienteSeleccionado = signal<number | null>(null);

  
 // El médico elegido en el desplegable (para mostrar nombre y valor)
  protected readonly medicoElegido = computed(() =>
    this.medicos().find((medico) => medico.id === this.idMedico()),
  );

  constructor() {
    this.reservarTurnoApiClient.listarMedicos().subscribe({
      next: (medicos) => this.medicos.set(medicos),
      error: (err) =>
        this.mensajes.add({
          severity: 'error',
          summary: 'Error',
          detail: mensajeDeError(err, 'No se pudieron cargar los médicos'),
        }),
    });
    //----Cargar pacinetes activos para el admin



    this.gestionReservaApiClient.obtenerPacientesActivos().subscribe({
      next: (pacientes) =>this.pacientes.set(pacientes),
      error: (err) =>
        this.mensajes.add({
          severity: 'error',
          summary: 'Error',
          detail: mensajeDeError(err, 'No se pudieron cargar los pacientes activos'),
        })
    })

}

  protected elegirMedico(valor: string): void {
    this.idMedico.set(valor ? Number(valor) : null);
    this.buscarHorarios();
  }
  
  protected elegirPaciente(valor: string): void {
    this.idPacienteSeleccionado.set(valor ? Number(valor) : null);
  }

  protected elegirFecha(valor: string): void {
    this.fecha.set(valor);
    this.buscarHorarios();
  }

  // Cada vez que cambia el médico o la fecha, se piden los horarios libres
  private buscarHorarios(): void {
    this.horarioElegido.set(null);
    this.horarios.set([]);

    const idMedico = this.idMedico();
    const fecha = this.fecha();
    if (!idMedico || !fecha) {
      return;
    }

    this.cargandoHorarios.set(true);
    this.reservarTurnoApiClient.horariosDisponibles(idMedico, fecha).subscribe({
      next: (respuesta) => {
        this.horarios.set(respuesta.horarios);
        this.cargandoHorarios.set(false);
      },
      error: (err) => {
        this.cargandoHorarios.set(false);
        this.mensajes.add({
          severity: 'error',
          summary: 'Error',
          detail: mensajeDeError(err, 'No se pudieron cargar los horarios'),
        });
      },
    });
  }

  protected confirmar(): void {
    const idMedico = this.idMedico();
    const fechaHora = this.horarioElegido();
    if (!idMedico || !fechaHora) {
      return;
    }

    this.enviando.set(true);

    const idPaciente = this.idPacienteSeleccionado();
const dto = idPaciente
  ? { idMedico, fechaHora, idPaciente }
  : { idMedico, fechaHora };
    this.gestionReservaApiClient.crear(dto).subscribe({
      next: () => {
        this.mensajes.add({ severity: 'success', summary: 'Listo', detail: 'Turno reservado' });
         const destino = this.router.url.startsWith('/admin')
          ? '/admin/reservar'
          : '/paciente/mis-turnos';
        void this.router.navigateByUrl('destino');
      },
      error: (err) => {
        this.enviando.set(false);
        this.mensajes.add({
          severity: 'error',
          summary: 'No se pudo reservar',
          detail: mensajeDeError(err, 'No se pudo reservar el turno'),
        });
        this.buscarHorarios(); // por si alguien ocupó ese horario mientras tanto
      },
    });
  }
}