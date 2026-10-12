import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, Matches } from "class-validator";
import { EstadosReservasEnum } from "../../enums/estados-reservas.enum.js";

export class ListReservasQueryDto {

    @ApiPropertyOptional({ example: "2026-09-15" ,description: "Obligatoria para el médico. El paciente puede omitirla para ver todos sus turnos." })
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "La fecha es obligatoria y debe tener formato YYYY-MM-DD" })
    @IsISO8601({ strict: true }, { message: "La fecha es obligatoria y debe tener formato YYYY-MM-DD" })
    @IsNotEmpty()
    fecha?: string;

    @ApiPropertyOptional({ enum: EstadosReservasEnum })
    @IsEnum(EstadosReservasEnum, { message: "El estado indicado no es valido" })
    @IsOptional()
    estado?: EstadosReservasEnum;

}
