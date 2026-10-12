import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';

import { EstadoReservaTag } from '../estado-reserva-tag/estado-reserva-tag';
import { EstadosReservasEnum } from '../estados-reservas-enum';
import { GestionReservaApiClient } from '../gestion/gestion-reserva-api-client';
import type { ListReservaDTO } from '../listado/list-reserva-dto';
import { mensajeDeError } from '../listado/reservas-listado';
import { ReservasListadoApiClient } from '../listado/reservas-listado-api-client';

// (hz) Pantalla del paciente: lista sus turnos y permite cancelarlos
@Component({
  selector: 'app-mis-turnos',
  imports: [DatePipe, CurrencyPipe, RouterLink, TableModule, ButtonModule, ConfirmDialogModule, EstadoReservaTag],
  providers: [ConfirmationService],
  templateUrl: './mis-turnos.html',
})
export class MisTurnos {
  private readonly reservasListadoApiClient = inject(ReservasListadoApiClient);
  private readonly gestionReservaApiClient = inject(GestionReservaApiClient);
  private readonly mensajes = inject(MessageService);
  private readonly confirmacion = inject(ConfirmationService);

  protected readonly turnos = signal<ListReservaDTO[]>([]);
  protected readonly cargando = signal(false);

  constructor() {
    this.cargar();
  }

  // Pide al backend los turnos del paciente (sin fecha = todos)
  protected cargar(): void {
    this.cargando.set(true);

    this.reservasListadoApiClient.listar().subscribe({
      next: (turnos) => {
        this.turnos.set(turnos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensajes.add({
          severity: 'error',
          summary: 'Error',
          detail: mensajeDeError(err, 'No se pudieron cargar tus turnos'),
        });
      },
    });
  }

  // Misma regla que el backend: turno ACTIVO y a partir de mañana
  protected puedeCancelar(turno: ListReservaDTO): boolean {
    if (turno.estado !== EstadosReservasEnum.ACTIVO) {
      return false;
    }
    const ahora = new Date();
    const inicioDeManana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
    return new Date(turno.fechaHora) >= inicioDeManana;
  }

  // Muestra el cartel "¿Confirmás cancelar...?"
  protected confirmarCancelacion(turno: ListReservaDTO): void {
    this.confirmacion.confirm({
      header: 'Cancelar turno',
      message: `¿Confirmás cancelar el turno con ${turno.medico}?`,
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'Volver',
      accept: () => this.cancelar(turno.id),
    });
  }

  private cancelar(idReserva: number): void {
    this.gestionReservaApiClient.cancelar(idReserva).subscribe({
      next: () => {
        this.mensajes.add({ severity: 'success', summary: 'Listo', detail: 'Turno cancelado' });
        this.cargar();
      },
      error: (err) =>
        this.mensajes.add({
          severity: 'error',
          summary: 'No se pudo cancelar',
          detail: mensajeDeError(err, 'No se pudo cancelar el turno'),
        }),
    });
  }
}