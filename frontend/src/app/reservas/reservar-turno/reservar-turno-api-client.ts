import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

// (hz) Datos de un médico, tal como los devuelve GET /medicos
export interface MedicoDTO {
  id: number;
  nombres: string;
  apellidos: string;
  matricula: number;
  valorConsulta: number;
}

// (hz) Respuesta de GET /reservas/disponibilidad
export interface HorariosDisponiblesDTO {
  fecha: string;
  horarios: string[];
}

// (hz) Llamadas al backend que necesita la pantalla de reservar turno
@Injectable({ providedIn: 'root' })
export class ReservarTurnoApiClient {
  private readonly http = inject(HttpClient);

  listarMedicos(): Observable<MedicoDTO[]> {
    return this.http.get<MedicoDTO[]>('/api/v1/medicos');
  }

  horariosDisponibles(idMedico: number, fecha: string): Observable<HorariosDisponiblesDTO> {
    const params = new HttpParams().set('idMedico', idMedico).set('fecha', fecha);
    return this.http.get<HorariosDisponiblesDTO>('/api/v1/reservas/disponibilidad', { params });
  }

  actualizarValorConsulta(
    idMedico: number,
    valorConsulta: number,
  ): Observable<void> {
    return this.http.put<void>(
      `/api/v1/medicos/${idMedico}/valor-consulta`,
      { valorConsulta },
    );
  }
}