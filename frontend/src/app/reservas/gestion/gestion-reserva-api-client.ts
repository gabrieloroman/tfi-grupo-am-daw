import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import { EstadosReservasEnum } from '../estados-reservas-enum';

@Injectable({ providedIn: 'root' })
export class GestionReservaApiClient {
  private readonly http = inject(HttpClient);

  registrarAsistencia(
    idReserva: number,
    estado: EstadosReservasEnum.ATENDIDO | EstadosReservasEnum.AUSENTE,
  ): Observable<void> {
    return this.http.put<void>(`/api/v1/reservas/${idReserva}`, { estado });
  }
}
