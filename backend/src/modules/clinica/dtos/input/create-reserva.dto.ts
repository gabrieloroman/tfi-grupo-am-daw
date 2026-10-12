import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt, IsNotEmpty, IsOptional } from "class-validator";

export class CreateReservaDto {

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    idMedico!: number;

    @ApiProperty({ required: false, description: "Solo lo envía el administrador. Para el paciente se toma del token." })
    @IsOptional()
    @IsInt()
    idPaciente?: number;

    @ApiProperty({ description: 'Fecha y hora del turno (ISO 8601)', example: '2026-09-15T10:00:00' })
    @IsDateString()
    @IsNotEmpty()
    fechaHora!: string;

}
