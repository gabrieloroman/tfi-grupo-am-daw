import { DatePipe } from '@angular/common';
import { Component, computed, inject, output, input } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { EstadosReservasEnum } from '../estados-reservas-enum';
import { GestionReservaApiClient } from '../gestion/gestion-reserva-api-client';
import type { ListReservaDTO } from '../listado/list-reserva-dto';
import { mensajeDeError } from '../listado/reservas-listado';

// (jt) Botón para que el administrador cancele un turno, hasta el momento en que inicia la consulta.
// La pantalla que lo use tiene que proveer ConfirmationService y tener un <p-confirmdialog />,
// igual que mis-turnos. Avisa con (cancelada) para que la pantalla recargue el listado.
@Component({
  selector: 'app-cancelar-reserva-boton',
  imports: [ButtonModule],
  providers: [DatePipe],
  template: `
    @if (puedeCancelar()) {
      <p-button
        label="Cancelar"
        size="small"
        severity="danger"
        [outlined]="true"
        (onClick)="confirmar()"
      />
    } @else {
      <span class="subtitulo-pagina">—</span>
    }
  `,
})
export class CancelarReservaBoton {
  private readonly gestionReservaApiClient = inject(GestionReservaApiClient);
  private readonly mensajes = inject(MessageService);
  private readonly confirmacion = inject(ConfirmationService);
  private readonly datePipe = inject(DatePipe);

  readonly turno = input.required<ListReservaDTO>();
  readonly cancelada = output<void>();

  // Misma regla que el backend: turno ACTIVO que todavía no empezó
  protected readonly puedeCancelar = computed(
    () =>
      this.turno().estado === EstadosReservasEnum.ACTIVO &&
      new Date(this.turno().fechaHora) > new Date(),
  );

  protected confirmar(): void {
    const turno = this.turno();
    const cuando = this.datePipe.transform(turno.fechaHora, "dd/MM/yyyy 'a las' HH:mm");

    this.confirmacion.confirm({
      header: 'Cancelar turno',
      message: `¿Confirmás cancelar el turno de ${turno.paciente} con ${turno.medico} del ${cuando}?`,
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'Volver',
      accept: () => this.cancelar(turno.id),
    });
  }

  private cancelar(idReserva: number): void {
    this.gestionReservaApiClient.cancelar(idReserva).subscribe({
      next: () => {
        this.mensajes.add({ severity: 'success', summary: 'Listo', detail: 'Turno cancelado' });
        this.cancelada.emit();
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
