import { ApiProperty } from "@nestjs/swagger";
import { EstadosReservasEnum } from "../../enums/estados-reservas.enum.js";

export class ReservaDTO {

    @ApiProperty()
    id!: number;

    @ApiProperty()
    idMedico!: number;

    @ApiProperty()
    medico!: string;

    @ApiProperty()
    idPaciente!: number;

    @ApiProperty()
    paciente!: string;

    @ApiProperty()
    fechaHora!: Date;

    @ApiProperty({ enum: EstadosReservasEnum })
    estado!: EstadosReservasEnum;

    @ApiProperty()
    valorConsulta!: number;

}
