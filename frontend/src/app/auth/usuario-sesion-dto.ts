import { RolesEnum } from './roles-enum';

export interface UsuarioSesionDTO {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  rol: RolesEnum;
}
