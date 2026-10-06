import { ApiProperty } from "@nestjs/swagger";
import { EstadosReservasEnum } from "../../enums/estados-reservas.enum.js";

export class ListReservaDTO {

    @ApiProperty()
    id!: number;

    @ApiProperty()
    medico!: string;

    @ApiProperty()
    paciente!: string;

    @ApiProperty()
    documentoPaciente!: string;

    @ApiProperty()
    fechaHora!: Date;

    @ApiProperty({ enum: EstadosReservasEnum })
    estado!: EstadosReservasEnum;

    @ApiProperty()
    valorConsulta!: number;

}
