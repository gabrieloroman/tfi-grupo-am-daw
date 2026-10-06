import { Component, computed, input } from '@angular/core';

import { EstadosReservasEnum } from '../estados-reservas-enum';

@Component({
  selector: 'app-estado-reserva-tag',
  template: `<span class="marca" [class]="'marca-' + estado().toLowerCase()">{{
    etiqueta()
  }}</span>`,
  styles: `
    .marca {
      display: inline-block;
      padding: 0.13rem 0.45rem;
      border: 1px solid;
      border-radius: 2px;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .marca-activo {
      color: #0f5563;
      background: #e7f1f3;
      border-color: #a9ccd3;
    }

    .marca-atendido {
      color: #3f5c3a;
      background: #eef3ea;
      border-color: #c2d4ba;
    }

    .marca-ausente {
      color: #855116;
      background: #faf1e2;
      border-color: #e2c79b;
    }

    .marca-cancelado {
      color: #77726b;
      background: #f2efe9;
      border-color: #ddd6cb;
    }
  `,
})
export class EstadoReservaTag {
  readonly estado = input.required<EstadosReservasEnum>();

  protected readonly etiqueta = computed(() => {
    const etiquetas: Record<EstadosReservasEnum, string> = {
      [EstadosReservasEnum.ACTIVO]: 'Vigente',
      [EstadosReservasEnum.ATENDIDO]: 'Atendido',
      [EstadosReservasEnum.AUSENTE]: 'Ausente',
      [EstadosReservasEnum.CANCELADO]: 'Cancelado',
    };
    return etiquetas[this.estado()];
  });
}
