import { ApiProperty } from "@nestjs/swagger";
import { IsISO8601, IsNumberString, Matches } from "class-validator";

export class DisponibilidadQueryDto {

    @ApiProperty({ example: "1", description: "ID del médico" })
    @IsNumberString({}, { message: "El médico indicado no es valido" })
    idMedico!: string;

    @ApiProperty({ example: "2026-10-20" })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "La fecha es obligatoria y debe tener formato YYYY-MM-DD" })
    @IsISO8601({ strict: true }, { message: "La fecha es obligatoria y debe tener formato YYYY-MM-DD" })
    fecha!: string;

}