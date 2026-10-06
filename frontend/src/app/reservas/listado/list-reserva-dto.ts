import { EstadosReservasEnum } from '../estados-reservas-enum';

export interface ListReservaDTO {
  id: number;
  fechaHora: string;
  estado: EstadosReservasEnum;
  valorConsulta: number;
  medico: string;
  paciente: string;
  documentoPaciente: string;
}

export interface FiltrosReservas {
  fecha?: string;
  estado?: EstadosReservasEnum;
}
