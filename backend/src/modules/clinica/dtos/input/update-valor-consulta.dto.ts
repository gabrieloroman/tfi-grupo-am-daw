import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";

export class UpdateValorConsultaDto {

    @ApiProperty({ description: 'Nuevo valor de la consulta del médico' })
    @IsInt()
    @IsNotEmpty()
    valorConsulta!: number;

}
