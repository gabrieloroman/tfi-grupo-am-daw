import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import type { FiltrosReservas, ListReservaDTO } from './list-reserva-dto';

@Injectable({ providedIn: 'root' })
export class ReservasListadoApiClient {
  private readonly http = inject(HttpClient);

  listar(filtros: FiltrosReservas = {}): Observable<ListReservaDTO[]> {
    let params = new HttpParams();

    if (filtros.fecha) params = params.set('fecha', filtros.fecha);
    if (filtros.estado) params = params.set('estado', filtros.estado);

    return this.http.get<ListReservaDTO[]>('/api/v1/reservas', { params });
  }
}
