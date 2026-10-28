import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import { EstadosReservasEnum } from '../estados-reservas-enum';

// (hz) Datos que se mandan al backend para reservar un turno
export interface CrearReservaDTO {
  idMedico: number;
  fechaHora: string;
  idPaciente?:number;
}

// (jt) Paciente tal como lo devuelve GET /reservas/pacientes-activos (solo administrador)
export interface PacienteDTO {
  id: number;
  nombres: string;
  apellidos: string;
  documento: string;
}

@Injectable({ providedIn: 'root' })
export class GestionReservaApiClient {
  private readonly http = inject(HttpClient);

  registrarAsistencia(
    idReserva: number,
    estado: EstadosReservasEnum.ATENDIDO | EstadosReservasEnum.AUSENTE,
  ): Observable<void> {
    return this.http.put<void>(`/api/v1/reservas/${idReserva}`, { estado });
  }

  // (hz) El paciente cancela un turno
  cancelar(idReserva: number): Observable<void> {
    return this.http.put<void>(`/api/v1/reservas/${idReserva}`, { estado: EstadosReservasEnum.CANCELADO });
  }

  // (hz) El paciente reserva un turno
  crear(dto: CrearReservaDTO): Observable<{ id: number }> {
    return this.http.post<{ id: number }>('/api/v1/reservas', dto);
  }

  //nuevo
  obtenerPacientesActivos(): Observable<PacienteDTO[]> {
    return this.http.get<PacienteDTO[]>('/api/v1/reservas/pacientes-activos');
  }

}
