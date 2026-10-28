import { ApiProperty } from "@nestjs/swagger";

// (jt) Datos de un paciente para que el administrador lo elija al reservar.
// Solo lo necesario: nunca la clave, el email ni el estado.
export class PacienteDTO {

    @ApiProperty()
    id!: number;

    @ApiProperty()
    nombres!: string;

    @ApiProperty()
    apellidos!: string;

    @ApiProperty()
    documento!: string;

}
