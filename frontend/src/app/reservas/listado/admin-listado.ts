
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

import { CancelarReservaBoton } from '../cancelar-reserva/cancelar-reserva-boton';
import { EstadosReservasEnum } from '../estados-reservas-enum';
import type { ListReservaDTO } from './list-reserva-dto';
import { ReservasListadoApiClient } from './reservas-listado-api-client';

@Component({
  selector: 'app-listado-admin',
  imports: [
    FormsModule,
    DatePipe,
    CurrencyPipe,
    TableModule,
    InputTextModule,
    ConfirmDialogModule,
    CancelarReservaBoton,
  ],
  providers: [ConfirmationService],
   templateUrl: './admin-listado.html', // <-- Acá cambiamos listado-admin por admin-listado
})
export class ListadoAdmin {
  private readonly reservasApi = inject(ReservasListadoApiClient);
  private readonly mensajes = inject(MessageService);

  protected readonly estados = EstadosReservasEnum;
  protected readonly turnos = signal<ListReservaDTO[]>([]);
  protected readonly cargando = signal(false);
  protected readonly fecha = signal('');
  protected readonly estado = signal('');

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);

    this.reservasApi.listar({
      fecha: this.fecha() || undefined,
      estado: this.estado()
        ? (this.estado() as EstadosReservasEnum)
        : undefined,
    }).subscribe({
      next: (turnos) => {
        this.turnos.set(turnos);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.mensajes.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los turnos',
        });
      },
    });
  }

  protected limpiarFiltros(): void {
    
    this.fecha.set('');
    this.estado.set('');
    this.cargar();
  }
}
