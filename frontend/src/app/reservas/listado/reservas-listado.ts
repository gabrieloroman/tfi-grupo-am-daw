import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

import { EstadoReservaTag } from '../estado-reserva-tag/estado-reserva-tag';
import { EstadosReservasEnum } from '../estados-reservas-enum';
import { GestionReservaApiClient } from '../gestion/gestion-reserva-api-client';
import type { ListReservaDTO } from './list-reserva-dto';
import { ReservasListadoApiClient } from './reservas-listado-api-client';

type EstadoAsistencia = EstadosReservasEnum.ATENDIDO | EstadosReservasEnum.AUSENTE;

function hoyEnFormatoIso(fecha: Date = new Date()): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function mensajeDeError(error: unknown, porDefecto: string): string {
  const detalle = (error as { error?: { message?: string | string[] } })?.error?.message;

  if (Array.isArray(detalle)) {
    return detalle.join('. ');
  }

  return detalle ?? porDefecto;
}

@Component({
  selector: 'app-reservas-listado',
  imports: [
    FormsModule,
    DatePipe,
    CurrencyPipe,
    TableModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    EstadoReservaTag,
  ],
  providers: [ConfirmationService],
  templateUrl: './reservas-listado.html',
})
export class ReservasListado {
  private readonly reservasListadoApiClient = inject(ReservasListadoApiClient);
  private readonly gestionReservaApiClient = inject(GestionReservaApiClient);
  private readonly mensajes = inject(MessageService);
  private readonly confirmacion = inject(ConfirmationService);

  protected readonly estados = EstadosReservasEnum;
  protected readonly turnos = signal<ListReservaDTO[]>([]);
  protected readonly cargando = signal(false);
  protected readonly fecha = signal(hoyEnFormatoIso());

  protected readonly puedeRegistrarAsistencia = computed(() => this.fecha() <= hoyEnFormatoIso());

  protected readonly cantidadPendientes = computed(
    () => this.turnos().filter((turno) => turno.estado === EstadosReservasEnum.ACTIVO).length,
  );

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);

    this.reservasListadoApiClient.listar({ fecha: this.fecha() }).subscribe({
      next: (turnos) => {
        this.turnos.set(turnos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.mensajes.add({
          severity: 'error',
          summary: 'Error',
          detail: mensajeDeError(err, 'No se pudo cargar la agenda'),
        });
      },
    });
  }

  protected cambiarFecha(valor: string): void {
    this.fecha.set(valor);
    this.cargar();
  }

  protected confirmarAsistencia(turno: ListReservaDTO, estado: EstadoAsistencia): void {
    const accion = estado === EstadosReservasEnum.ATENDIDO ? 'atendido' : 'ausente';

    this.confirmacion.confirm({
      header: `Marcar como ${accion}`,
      message: `¿Confirmas marcar como ${accion} el turno de ${turno.paciente}?`,
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      accept: () => this.registrar(turno.id, estado),
    });
  }

  private registrar(idReserva: number, estado: EstadoAsistencia): void {
    this.gestionReservaApiClient.registrarAsistencia(idReserva, estado).subscribe({
      next: () => {
        this.mensajes.add({
          severity: 'success',
          summary: 'Listo',
          detail: `Turno marcado como ${estado.toLowerCase()}`,
        });
        this.cargar();
      },
      error: (err) =>
        this.mensajes.add({
          severity: 'error',
          summary: 'No se pudo registrar',
          detail: mensajeDeError(err, 'No se pudo registrar la asistencia'),
        }),
    });
  }
}
